import {
  Post,
  Body,
  Controller,
  Res,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
  Get,
} from '@nestjs/common';
import {
  AuthorizationRequest,
  AuthorizationResponse,
  ConfirmEmailRequest,
  RegistrationRequest,
  RegistrationResponse,
  ResendConfirmEmailTokenRequest,
  ResendConfirmEmailTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from 'src/proto/auth';
import { ApiGatewayService } from './api-gateway.service';
import { Request, Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageResponse } from 'src/proto/image';

@Controller('api')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post('registration')
  async registration(
    @Body() dto: RegistrationRequest,
  ): Promise<RegistrationResponse> {
    return await this.apiGatewayService.registration(dto);
  }

  @Post('authorization')
  async authorization(
    @Body() dto: AuthorizationRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthorizationResponse> {
    return await this.apiGatewayService.authorization(dto, res);
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthorizationResponse> {
    return await this.apiGatewayService.refreshToken(req, res);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return await this.apiGatewayService.resetPassword(dto);
  }

  @UseGuards(AuthGuard)
  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId: string,
  ): Promise<UploadImageResponse> {
    return await this.apiGatewayService.uploadImage({
      userId,
      fileMetadata: {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
      },
      fileChunks: file.buffer,
    });
  }

  @UseGuards(AuthGuard)
  @Get('get-last-image-info')
  async getLastImageInfo(@Query('userId') userId: string) {
    return await this.apiGatewayService.getLastImageInfo({ userId });
  }

  @UseGuards(AuthGuard)
  @Get('get-optimized-image')
  async getOptimizedImage(@Query('imageId') imageId: string) {
    return await this.apiGatewayService.getOptimizedImage({ imageId });
  }

  @Post('confirm-email')
  async confirmEmail(
    @Body() dto: ConfirmEmailRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthorizationResponse> {
    return await this.apiGatewayService.confirmEmail(dto, res);
  }

  @Post('resend-confirm-email-token')
  async resendConfirmEmailToken(
    @Body() dto: ResendConfirmEmailTokenRequest,
  ): Promise<ResendConfirmEmailTokenResponse> {
    return await this.apiGatewayService.resendConfirmEmailToken(dto);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.apiGatewayService.logout(req, res);
  }

  @UseGuards(AuthGuard)
  @Post('test')
  test() {
    return 'test';
  }
}
