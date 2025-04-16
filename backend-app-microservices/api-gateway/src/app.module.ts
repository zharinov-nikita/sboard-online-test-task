import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GrpcModule } from './grpc/grpc.module';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GrpcModule,
    ApiGatewayModule,
  ],
})
export class AppModule {}
