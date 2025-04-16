import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { RpcToHttpExceptionFilter } from './filter/rpc-to-http-exception.filter';
async function bootstrap() {
  const configService = new ConfigService();

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  app.enableCors({
    origin: configService.getOrThrow('ENABLE_CORS_ORIGIN').split(','),
    credentials: true,
  });

  const PORT = configService.getOrThrow('PORT');

  await app.listen(PORT);
}
bootstrap();
