import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'), // Хост базы данных
        port: Number(configService.getOrThrow('DB_PORT')), // Порт базы данных
        username: configService.getOrThrow('DB_USERNAME'), // Имя пользователя
        password: configService.getOrThrow('DB_PASSWORD'), // Пароль
        database: configService.getOrThrow('DB_DATABASE'), // Название базы данных
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Автоматическая синхронизация
        dropSchema: false, // Удаление схемы при каждом запуске приложения
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
