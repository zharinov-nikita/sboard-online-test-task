import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType } from './types/file.type';
import { UploadImageDto } from './dto/upload-image.dto';
import { GetLastImageInfoDto } from './dto/get-last-image-info.dto';

@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: FileType,
    @Body() dto: UploadImageDto,
  ) {
    return this.imageService.uploadImage({
      fileChunks: Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer),
      fileMetadata: {
        encoding: file.encoding,
        fieldname: file.fieldname,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
      },
      userId: dto.userId,
    });
  }

  @Post('/get-last-image-info')
  async getLastImageInfo(@Body() dto: GetLastImageInfoDto) {
    return this.imageService.getLastImageInfo({ userId: dto.userId });
  }

  @Get('/get-optimized-image/:id')
  async getOptimizedImage(@Param('id') id: string) {
    return this.imageService.getOptimizedImage({ imageId: id });
  }
}
