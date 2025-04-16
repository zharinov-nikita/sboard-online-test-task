import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthorizationRequest,
  AuthorizationResponse,
  AuthServiceClient,
  ConfirmEmailRequest,
  RegistrationRequest,
  RegistrationResponse,
  ResendConfirmEmailTokenRequest,
  ResendConfirmEmailTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../proto/auth';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom, of } from 'rxjs';
import {
  GetLastImageInfoRequest,
  GetLastImageInfoResponse,
  GetOptimizedImageRequest,
  GetOptimizedImageResponse,
  Image,
  ImageServiceClient,
  UploadImageRequest,
  UploadImageResponse,
} from 'src/proto/image';
import { Request, Response } from 'express';
import { ApiGatewayWebSocket } from './api-gateway.web-socket';
import { status } from '@grpc/grpc-js';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);
  private authServiceClient: AuthServiceClient;
  private imageServiceClient: ImageServiceClient;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientGrpc,
    @Inject('IMAGE_SERVICE')
    private readonly imageClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authServiceClient =
      this.authClient.getService<AuthServiceClient>('AuthService');
    this.imageServiceClient =
      this.imageClient.getService<ImageServiceClient>('ImageService');
  }

  async registration(dto: RegistrationRequest): Promise<RegistrationResponse> {
    return await lastValueFrom(this.authServiceClient.registration(dto));
  }

  async authorization(
    dto: AuthorizationRequest,
    res: Response,
  ): Promise<AuthorizationResponse> {
    const response = await lastValueFrom(
      this.authServiceClient.authorization(dto),
    );

    if (!response.user) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    this.setRefreshTokenToCookie(res, response.user.refreshToken);

    return response;
  }

  async refreshToken(
    req: Request,
    res: Response,
  ): Promise<AuthorizationResponse> {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      const errorMessage = 'Refresh token не найден';
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    const response = await lastValueFrom(
      this.authServiceClient.refreshToken({ refreshToken }),
    );

    if (!response.user) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    this.setRefreshTokenToCookie(res, response.user.refreshToken);

    return response;
  }

  async resetPassword(
    dto: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return await lastValueFrom(this.authServiceClient.resetPassword(dto));
  }

  async uploadImage(dto: UploadImageRequest): Promise<UploadImageResponse> {
    const observableDto = of(dto);
    return await lastValueFrom(
      this.imageServiceClient.uploadImage(observableDto),
    );
  }

  async getLastImageInfo(
    dto: GetLastImageInfoRequest,
  ): Promise<GetLastImageInfoResponse> {
    return await lastValueFrom(this.imageServiceClient.getLastImageInfo(dto));
  }

  async getOptimizedImage(
    dto: GetOptimizedImageRequest,
  ): Promise<GetOptimizedImageResponse> {
    return await lastValueFrom(this.imageServiceClient.getOptimizedImage(dto));
  }

  async confirmEmail(
    dto: ConfirmEmailRequest,
    res: Response,
  ): Promise<AuthorizationResponse> {
    const response = await lastValueFrom(
      this.authServiceClient.confirmEmail(dto),
    );

    if (!response.user) {
      const errorMessage = 'Ошибка подтверждения почты';
      this.logger.error(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    this.setRefreshTokenToCookie(res, response.user.refreshToken);

    return response;
  }

  async resendConfirmEmailToken(
    dto: ResendConfirmEmailTokenRequest,
  ): Promise<ResendConfirmEmailTokenResponse> {
    return await lastValueFrom(
      this.authServiceClient.resendConfirmEmailToken(dto),
    );
  }

  logout(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      res.clearCookie('refreshToken');
    }

    this.logger.log('logout');
    return res.status(200).send({ message: 'Вы успешно вышли из системы' });
  }

  private setRefreshTokenToCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}
