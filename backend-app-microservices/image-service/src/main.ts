import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { EnvInterface } from './interfaces/env.interface';

async function bootstrap() {
  const configService = new ConfigService<EnvInterface>();

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const imageGRPC = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'image',
      protoPath: join(__dirname, '../../shared-proto/image.proto'),
      url: configService.getOrThrow('GRPC_URL'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
