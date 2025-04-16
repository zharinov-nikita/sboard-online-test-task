import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: join(__dirname, '../../../shared-proto/auth.proto'),
            url: configService.getOrThrow('GRPC_AUTH_SERVICE'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'IMAGE_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'image',
            protoPath: join(__dirname, '../../../shared-proto/image.proto'),
            url: configService.getOrThrow('GRPC_IMAGE_SERVICE'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcModule {}
