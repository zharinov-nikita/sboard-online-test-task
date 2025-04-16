import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
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
  ValidateAccessTokenRequest,
  ValidateAccessTokenResponse,
} from '../proto/auth';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registration(dto: RegistrationRequest): Promise<RegistrationResponse> {
    const userAlreadyExistsCheck = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (userAlreadyExistsCheck) {
      const errorMessage = `Пользователь с email ${dto.email} уже существует`;
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        details: errorMessage,
      });
    }

    const { confirmEmailToken } = this.generateConfirmEmailToken();

    const encryptPassword = this.encryptPassword(dto.password);

    const user = this.userRepository.create({
      email: dto.email,
      password: encryptPassword,
      isConfirmEmail: false,
      confirmEmailToken,
      refreshToken: '',
    });

    await this.sendConfirmEmailToken({
      confirmEmail: user.email,
      confirmEmailToken,
    });

    return await this.userRepository.save(user);
  }

  private async sendConfirmEmailToken({
    confirmEmail,
    confirmEmailToken,
  }: {
    confirmEmail: string;
    confirmEmailToken: string;
  }): Promise<void> {
    await this.mailService.send({
      to: confirmEmail,
      subject: 'Подтверждение почты',
      html: this.createHtmlTemplateForConfirmEmail(confirmEmailToken),
    });
  }

  private createHtmlTemplateForConfirmEmail(confirmEmailToken: string) {
    return `
      <div>
      <h1>Добро пожаловать</h1>
        <div>
          Код подтверждения почты (скопируйте и вставьте в форму):
        </div>
        <br />
        <div>
          <strong>${confirmEmailToken}</strong>
        </div>
      </div>
    `;
  }

  async resendConfirmEmailToken(
    dto: ResendConfirmEmailTokenRequest,
  ): Promise<ResendConfirmEmailTokenResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.confirmEmail },
    });

    if (!user) {
      const errorMessage = `Пользователь с email ${dto.confirmEmail} не найден`;
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    await this.mailService.send({
      to: user.email,
      subject: 'Подтверждение почты',
      html: this.createHtmlTemplateForConfirmEmail(user.confirmEmailToken),
    });

    return {
      message: `Код подтверждения отправлен на почту ${dto.confirmEmail}`,
    };
  }

  async authorization(
    dto: AuthorizationRequest,
  ): Promise<AuthorizationResponse> {
    const candidate = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!candidate) {
      const errorMessage = 'Не верный логин или  пароль';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        details: errorMessage,
      });
    }

    const isValidPassword = this.decryptPassword({
      plainPassword: dto.password,
      hashedPassword: candidate.password,
    });

    if (!isValidPassword) {
      const errorMessage = 'Не верный логин или  пароль';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        details: errorMessage,
      });
    }

    if (!candidate.isConfirmEmail) {
      await this.sendConfirmEmailToken({
        confirmEmail: candidate.email,
        confirmEmailToken: candidate.confirmEmailToken,
      });

      return {
        accessToken: '',
        user: candidate,
      };
    }

    const refreshToken = this.generateRefreshToken(candidate.email);

    await this.userRepository.update(candidate.id, {
      refreshToken,
    });

    const user = await this.userRepository.findOne({
      where: { email: candidate.email },
    });

    if (!user) {
      const errorMessage = 'Ошибка авторизации';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.INTERNAL,
        details: errorMessage,
      });
    }

    return {
      user,
      accessToken: this.generateAccessToken(dto.email),
    };
  }

  async confirmEmail(dto: ConfirmEmailRequest): Promise<AuthorizationResponse> {
    const { confirmEmail, confirmEmailToken } = dto;

    const user = await this.userRepository.findOne({
      where: { email: confirmEmail, confirmEmailToken },
    });

    if (!user) {
      const errorMessage =
        'Пользователь не найден или неверный код подтверждения';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    const refreshToken = this.generateRefreshToken(user.email);

    await this.userRepository.update(user.id, {
      isConfirmEmail: true,
      refreshToken,
    });

    const updateUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!updateUser) {
      const errorMessage = 'Ошибка авторизации';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.INTERNAL,
        details: errorMessage,
      });
    }

    return {
      user: updateUser,
      accessToken: this.generateAccessToken(user.email),
    };
  }

  async refreshToken(dto: RefreshTokenRequest): Promise<AuthorizationResponse> {
    const { refreshToken } = dto;

    // Проверяем подпись и срок действия refresh token
    const payload = await this.jwtService.verify(refreshToken, {
      secret: this.configService.getOrThrow('JWT_SECRET_KEY'),
    });

    const user = await this.userRepository.findOne({
      where: { email: payload.email },
    });

    if (!user || user.refreshToken !== refreshToken) {
      const errorMessage = 'Не верный refresh token';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        details: errorMessage,
      });
    }

    const accessToken = this.generateAccessToken(user.email);

    const newRefreshToken = this.generateRefreshToken(user.email);

    await this.userRepository.update(user.id, {
      refreshToken: newRefreshToken,
    });

    const updateUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!updateUser) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    return {
      user: updateUser,
      accessToken,
    };
  }

  async validateAccessToken(
    dto: ValidateAccessTokenRequest,
  ): Promise<ValidateAccessTokenResponse> {
    const { accessToken } = dto;

    // Проверяем подпись и срок действия access token
    const payload = await this.jwtService.verify(accessToken, {
      secret: this.configService.getOrThrow('JWT_SECRET_KEY'),
    });

    const user = await this.userRepository.findOne({
      where: { email: payload.email },
    });

    if (!user) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    return user ? { userId: user.id, isValid: true } : { isValid: false };
  }

  async resetPassword(
    dto: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    if (!user.isConfirmEmail) {
      const errorMessage = 'Пользователь не подтвердил почту';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    const newPassword = crypto.randomUUID();

    const encryptPassword = this.encryptPassword(newPassword);

    await this.userRepository.update(user.id, {
      password: encryptPassword,
    });

    await this.mailService.send({
      to: email,
      subject: 'Сброс пароля',
      html: `Ваш новый пароль: ${newPassword}`,
    });

    return {
      message: `Пароль успешно сброшен - сообщение отправлено на почту ${user.email}`,
    };
  }

  async getUser(dto: GetUserRequest): Promise<User> {
    const { id } = dto;

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    return user;
  }

  async updateUser(dto: UpdateUserRequest): Promise<User> {
    const { id, email, password } = dto;

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      const errorMessage = 'Пользователь не найден';
      this.logger.error(errorMessage);
      throw new RpcException({
        code: status.NOT_FOUND,
        details: errorMessage,
      });
    }

    if (email) user.email = email;
    if (password) user.password = this.encryptPassword(password);

    return await this.userRepository.save(user);
  }

  private generateConfirmEmailToken() {
    return { confirmEmailToken: crypto.randomUUID() };
  }

  private encryptPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  private decryptPassword({
    plainPassword,
    hashedPassword,
  }: {
    plainPassword: string;
    hashedPassword: string;
  }) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  private generateAccessToken(email: string) {
    return this.jwtService.sign(
      { email },
      {
        expiresIn: this.configService.getOrThrow('JWT_EXPIRES_IN_ACCESS_TOKEN'),
        secret: this.configService.getOrThrow('JWT_SECRET_KEY'),
      },
    );
  }

  private generateRefreshToken(email: string) {
    return this.jwtService.sign(
      { email },
      {
        expiresIn: this.configService.getOrThrow(
          'JWT_EXPIRES_IN_REFRESH_TOKEN',
        ),
        secret: this.configService.getOrThrow('JWT_SECRET_KEY'),
      },
    );
  }
}
