import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService();

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const authGRPC = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../shared-proto/auth.proto'),
      url: configService.getOrThrow('GRPC_URL'),
    },
  });

  const PORT = configService.getOrThrow('PORT');

  await app.startAllMicroservices();
  await app.listen(PORT);
}
bootstrap();
