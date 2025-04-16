import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { GrpcModule } from 'src/grpc/grpc.module';
import { ApiGatewayWebSocket } from './api-gateway.web-socket';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GrpcModule],
  providers: [ApiGatewayService, ApiGatewayWebSocket],
  controllers: [ApiGatewayController],
})
export class ApiGatewayModule {}
