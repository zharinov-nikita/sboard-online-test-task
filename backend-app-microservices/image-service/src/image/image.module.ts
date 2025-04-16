import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MinioModule } from '../minio/minio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { ImageGrpcController } from './image.grpc.controller';

@Module({
  imports: [MinioModule, TypeOrmModule.forFeature([Image])],
  providers: [ImageService],
  controllers: [ImageController, ImageGrpcController],
})
export class ImageModule {}
