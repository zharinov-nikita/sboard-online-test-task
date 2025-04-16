import { GrpcMethod, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  AuthorizationRequest,
  AuthorizationResponse,
  ConfirmEmailRequest,
  GetUserRequest,
  RefreshTokenRequest,
  RegistrationRequest,
  RegistrationResponse,
  ResendConfirmEmailTokenRequest,
  ResendConfirmEmailTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateUserRequest,
  User,
  ValidateAccessTokenRequest,
  ValidateAccessTokenResponse,
} from '../proto/auth';
import { Controller } from '@nestjs/common';

@Controller()
export class AuthControllerGrpc {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'registration')
  async registration(
    @Payload() dto: RegistrationRequest,
  ): Promise<RegistrationResponse> {
    return await this.authService.registration(dto);
  }

  @GrpcMethod('AuthService', 'authorization')
  async authorization(
    @Payload() dto: AuthorizationRequest,
  ): Promise<AuthorizationResponse> {
    return await this.authService.authorization(dto);
  }

  @GrpcMethod('AuthService', 'refreshToken')
  async refreshToken(
    @Payload() dto: RefreshTokenRequest,
  ): Promise<AuthorizationResponse> {
    return await this.authService.refreshToken(dto);
  }

  @GrpcMethod('AuthService', 'validateAccessToken')
  async validateAccessToken(
    @Payload() dto: ValidateAccessTokenRequest,
  ): Promise<ValidateAccessTokenResponse> {
    return await this.authService.validateAccessToken(dto);
  }

  @GrpcMethod('AuthService', 'resetPassword')
  async resetPassword(
    @Payload() dto: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return await this.authService.resetPassword(dto);
  }

  @GrpcMethod('AuthService', 'confirmEmail')
  async confirmEmail(
    @Payload() dto: ConfirmEmailRequest,
  ): Promise<AuthorizationResponse> {
    return await this.authService.confirmEmail(dto);
  }

  @GrpcMethod('AuthService', 'getUser')
  async getUser(@Payload() dto: GetUserRequest): Promise<User> {
    return await this.authService.getUser(dto);
  }

  @GrpcMethod('AuthService', 'updateUser')
  async updateUser(@Payload() dto: UpdateUserRequest): Promise<User> {
    return await this.authService.updateUser(dto);
  }

  @GrpcMethod('AuthService', 'resendConfirmEmailToken')
  async resendConfirmEmailToken(
    @Payload() dto: ResendConfirmEmailTokenRequest,
  ): Promise<ResendConfirmEmailTokenResponse> {
    return await this.authService.resendConfirmEmailToken(dto);
  }
}
