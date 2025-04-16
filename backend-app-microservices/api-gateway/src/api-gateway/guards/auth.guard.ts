import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Request } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthServiceClient } from 'src/proto/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private authServiceClient: AuthServiceClient;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authServiceClient =
      this.authClient.getService<AuthServiceClient>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      const errorMessage = 'Access token отсутствует или некорректный';
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      const errorMessage = 'Access token отсутствует';
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    try {
      const response = await lastValueFrom(
        this.authServiceClient.validateAccessToken({ accessToken }),
      );

      return response.isValid;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Неверный или просроченный токен');
    }
  }
}
