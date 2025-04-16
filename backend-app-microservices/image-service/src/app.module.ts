import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageModule } from './image/image.module';
import { EnvInterface } from './interfaces/env.interface';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvInterface>) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'), // Хост базы данных
        port: configService.getOrThrow('DB_PORT'), // Порт базы данных
        username: configService.getOrThrow('DB_USERNAME'), // Имя пользователя
        password: configService.getOrThrow('DB_PASSWORD'), // Пароль
        database: configService.getOrThrow('DB_DATABASE'), // Название базы данных
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Автоматическая синхронизация
        dropSchema: false, // Удаление схемы при каждом запуске приложения
      }),
    }),
    ImageModule,
  ],
})
export class AppModule {}
