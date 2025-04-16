import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { ImageService } from './image.service';
import { GetLastImageInfoDto } from './dto/get-last-image-info.dto';
import { Observable } from 'rxjs';
import { UploadImageRequest } from 'src/proto/image';

@Controller()
export class ImageGrpcController {
  constructor(private readonly imageService: ImageService) {}

  @GrpcMethod('ImageService', 'GetLastImageInfo')
  async getLastImageInfo({ userId }: GetLastImageInfoDto) {
    return await this.imageService.getLastImageInfo({ userId });
  }

  @GrpcMethod('ImageService', 'GetOptimizedImage')
  async getOptimizedImage({ imageId }: { imageId: string }) {
    return await this.imageService.getOptimizedImage({ imageId });
  }

  @GrpcStreamMethod('ImageService', 'UploadImage')
  uploadImage(stream: Observable<UploadImageRequest>) {
    return this.imageService.uploadImageStream(stream);
  }
}
