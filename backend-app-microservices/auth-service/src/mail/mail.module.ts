import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow('NODE_MAILER_HOST'),
          port: Number(configService.getOrThrow('NODE_MAILER_PORT')),
          secure: false,
          auth: {
            user: configService.getOrThrow('NODE_MAILER_AUTH_USER'),
            pass: configService.getOrThrow('NODE_MAILER_AUTH_PASS'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
