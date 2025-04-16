import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MinioService } from '../minio/minio.service';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { Queue, Worker } from 'bullmq';
import * as sharp from 'sharp';
import { ProcessingStatus } from './enums/processing-status.enum';
import * as path from 'path';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import {
  GetLastImageInfoRequest,
  GetLastImageInfoResponse,
  GetOptimizedImageRequest,
  GetOptimizedImageResponse,
  UploadImageRequest,
  UploadImageResponse,
} from 'src/proto/image';
import { status } from '@grpc/grpc-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private imageQueue: Queue;
  private imageWorker: Worker;

  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private minioService: MinioService,
    private configService: ConfigService,
  ) {
    this.setupQueue();
  }

  private async setupQueue() {
    // 1. Создаём очередь
    this.imageQueue = new Queue('image-processing', {
      connection: {
        host: this.configService.getOrThrow('REDIS_HOST'),
        port: Number(this.configService.getOrThrow('REDIS_PORT')),
      },
    });

    // 2. Создаём обработчик
    this.imageWorker = new Worker<{
      imageId: string;
      userId: string;
      imageOriginalName: string;
    }>(
      'image-processing',
      async (job) => {
        try {
          const { imageId } = job.data;

          const image = await this.imageRepository.findOneBy({
            id: imageId,
          });

          if (!image) {
            const errorMessage = 'Изображение не найдено';
            this.logger.error(errorMessage);
            throw new RpcException({
              details: errorMessage,
              status: status.NOT_FOUND,
            });
          }

          const originalBuffer = await this.minioService.getFile(
            'originals',
            image.generatedNameForOriginalsImage,
          );

          if (!originalBuffer) {
            const errorMessage = 'Оригинальный файл не найден';
            this.logger.error(errorMessage);
            throw new RpcException({
              details: errorMessage,
              status: status.NOT_FOUND,
            });
          }

          const webpBuffer = await sharp(originalBuffer)
            .webp({ quality: 80 })
            .toBuffer();

          const generatedNameForProcessedImage = this.generateUniqueFileName(
            image.originalName,
            '.webp',
          );

          await this.minioService.uploadFile(
            'processed',
            generatedNameForProcessedImage,
            webpBuffer,
            webpBuffer.length, // Размер файла в байтах
            'image/webp', // MIME-тип для webp изображений
          );

          const processedImagePath = await this.minioService.getFileUrl(
            'processed',
            generatedNameForProcessedImage,
          );

          this.logger.log(
            'Обработка изображения завершена',
            processedImagePath,
          );

          // ЗАДЕРЖКА В 5000 мс (имитация долгой обработки изображения)
          await new Promise((resolve) => setTimeout(resolve, 5000));

          await job.updateProgress({
            userId: job.data.userId,
            imageId: job.data.imageId,
            imageOriginalName: job.data.imageOriginalName,
            processingStatus: ProcessingStatus.PROCESSING,
          });

          await this.imageRepository.update(imageId, {
            processingStatus: ProcessingStatus.COMPLETED,
            generatedNameForProcessedImage,
            processedImagePath,
          });

          // ЗАДЕРЖКА В 5000 мс (имитация долгой обработки изображения)
          await new Promise((resolve) => setTimeout(resolve, 5000));

          await job.updateProgress({
            userId: job.data.userId,
            imageId: job.data.imageId,
            imageOriginalName: job.data.imageOriginalName,
            processingStatus: ProcessingStatus.COMPLETED,
          });
        } catch (error) {
          await job.updateProgress({
            processingStatus: ProcessingStatus.FAILED,
          });
          throw new RpcException(error);
        }
      },
      {
        connection: {
          host: this.configService.getOrThrow('REDIS_HOST'),
          port: Number(this.configService.getOrThrow('REDIS_PORT')),
        },
      },
    );
  }

  async uploadImage(dto: UploadImageRequest): Promise<UploadImageResponse> {
    try {
      const { fileChunks, fileMetadata, userId } = dto;

      if (!fileChunks || !fileMetadata || !userId) {
        const errorMessage =
          'Не указаны все необходимые поля для загрузки изображения fileChunks, fileMetadata, userId';
        throw new RpcException({
          details: errorMessage,
          status: status.INVALID_ARGUMENT,
        });
      }

      const basename = path.basename(fileMetadata.originalname);

      const generatedNameForOriginalsImage = this.generateUniqueFileName(
        fileMetadata.originalname,
      );

      // Сохраняем оригинал в MinIO
      await this.minioService.uploadFile(
        'originals',
        generatedNameForOriginalsImage,
        Buffer.from(fileChunks),
        fileMetadata.size,
        fileMetadata.mimetype,
      );

      const originalsImagePath = await this.minioService.getFileUrl(
        'originals',
        generatedNameForOriginalsImage,
      );

      this.logger.log('Изображение успешно загружено', originalsImagePath);

      const createdImage = this.imageRepository.create({
        userId,
        createdAt: new Date().toISOString(),
        originalName: basename,
        generatedNameForOriginalsImage,
        originalsImagePath,
        processedImagePath: '',
        generatedNameForProcessedImage: '',
        processingStatus: ProcessingStatus.UPLOADED,
        size: fileMetadata.size,
      });

      const savedImage = await this.imageRepository.save(createdImage);

      // Добавляем задачу в очередь на обработку
      const job = await this.imageQueue.add('process-image', {
        imageId: savedImage.id,
        userId,
        imageOriginalName: fileMetadata.originalname,
      });

      await job.updateProgress({
        userId,
        imageId: savedImage.id,
        imageOriginalName: fileMetadata.originalname,
        processingStatus: ProcessingStatus.UPLOADED,
      });

      return createdImage ? { image: createdImage } : { isNull: true };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  private generateUniqueFileName(
    originalName: string,
    customExtension?: string,
  ): string {
    const extension = path.extname(originalName).toLowerCase();

    return `${crypto.randomUUID()}${customExtension ? customExtension : extension}`;
  }

  async onApplicationShutdown() {
    await this.imageWorker.close();
    await this.imageQueue.close();
  }

  async getLastImageInfo(
    dto: GetLastImageInfoRequest,
  ): Promise<GetLastImageInfoResponse> {
    try {
      const image = await this.imageRepository.findOne({
        where: { userId: dto.userId },
        order: { createdAt: 'DESC' },
      });

      return image ? { image } : { isNull: true };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getOptimizedImage(
    dto: GetOptimizedImageRequest,
  ): Promise<GetOptimizedImageResponse> {
    try {
      if (!dto.imageId) {
        const errorMessage = 'imageId является обязательным аргументом';
        this.logger.error(errorMessage);
        throw new RpcException({
          details: errorMessage,
          status: status.INVALID_ARGUMENT,
        });
      }

      const image = await this.imageRepository.findOne({
        where: { id: dto.imageId },
      });

      if (!image) {
        throw new NotFoundException('Изображение не найдено');
      }

      const optimizedImage = await this.minioService.getFile(
        'processed',
        image.generatedNameForProcessedImage,
      );

      if (!optimizedImage) {
        throw new NotFoundException('Оптимизированное изображение не найдено');
      }

      return optimizedImage ? { optimizedImage } : { isNull: true };
    } catch (error) {
      this.logger.error(
        'Ошибка при получении оптимизированного изображения',
        error,
      );
      throw new NotFoundException('Изображение не найдено');
    }
  }

  uploadImageStream(stream: Observable<UploadImageRequest>) {
    return new Observable<UploadImageResponse>((observer) => {
      let userId: string | null = null;
      let fileMetadata: UploadImageRequest['fileMetadata'] | null = null;
      let fileChunks: UploadImageRequest['fileChunks'] | null = null;

      const subscription = stream.subscribe({
        next: (data) => {
          if (data.fileMetadata) {
            fileMetadata = data.fileMetadata;
          }

          if (data.userId) {
            userId = data.userId;
          }

          if (data.fileChunks) {
            fileChunks = data.fileChunks;
          }
        },
        error: (error) => {
          this.logger.error(error);
          observer.error(error);
        },
        complete: () => {
          if (!userId) {
            const errorMessage = 'userId не был передан';
            this.logger.error(errorMessage);
            observer.error(
              new RpcException({
                details: errorMessage,
                status: status.INVALID_ARGUMENT,
              }),
            );
            return;
          }

          if (!fileMetadata) {
            const errorMessage = 'metadata не была передана';
            this.logger.error(errorMessage);
            observer.error(
              new RpcException({
                details: errorMessage,
                status: status.INVALID_ARGUMENT,
              }),
            );
            return;
          }

          if (!fileChunks) {
            const errorMessage = 'fileChunks не были переданы';
            this.logger.error(errorMessage);
            observer.error(
              new RpcException({
                details: errorMessage,
                status: status.INVALID_ARGUMENT,
              }),
            );
            return;
          }

          this.uploadImage({ fileChunks, fileMetadata, userId })
            .then((image) => {
              observer.next(image);
              observer.complete();
            })
            .catch((error) => {
              this.logger.error('Ошибка при загрузке изображения', error);
              observer.error(error);
            });
        },
      });

      return () => subscription.unsubscribe();
    });
  }
}
