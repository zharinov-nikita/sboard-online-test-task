import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { Readable } from 'stream';
import { promisify } from 'util';
import { BucketNameType } from './types/bucket-name.type';
import { ConfigService } from '@nestjs/config';
import { EnvInterface } from 'src/interfaces/env.interface';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;

  constructor(private readonly configService: ConfigService<EnvInterface>) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow('MINIO_ENDPOINT'),
      port: this.configService.getOrThrow('MINIO_PORT'),
      useSSL: false,
      accessKey: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
    });
  }

  async uploadFile(
    bucketName: BucketNameType,
    objectName: string,
    buffer: Buffer,
    size: number,
    mimetype: string,
  ) {
    await this.createBucketIfNotExists(bucketName);
    return await this.minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      size,
      {
        'Content-Type': mimetype,
      },
    );
  }

  async getFileUrl(
    bucketName: BucketNameType,
    objectName: string,
  ): Promise<string> {
    return `${this.configService.getOrThrow('MINIO_PUBLIC_URL')}/${bucketName}/${objectName}`;
  }

  async getFile(
    bucketName: BucketNameType,
    objectName: string,
  ): Promise<Buffer> {
    const getObjectAsync = promisify(
      this.minioClient.getObject.bind(this.minioClient),
    );

    try {
      const stream: Readable = await getObjectAsync(bucketName, objectName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to get object from MinIO: ${error.message}`);
    }
  }

  private async createBucketIfNotExists(bucketName: BucketNameType) {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      // Создаем bucket, если он не существует
      await this.minioClient.makeBucket(bucketName);

      // https://gist.github.com/krishnasrinivas/2f5a9affe6be6aff42fe723f02c86d6a
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(
        bucketName,
        JSON.stringify(policy),
      );
    }
  }
}
