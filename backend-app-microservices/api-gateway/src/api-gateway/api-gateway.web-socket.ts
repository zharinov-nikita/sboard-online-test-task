import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthServiceClient } from 'src/proto/auth';
import { lastValueFrom } from 'rxjs';
import { QueueEvents } from 'bullmq';
import { ConfigService } from '@nestjs/config';

interface NotifyImageChangeData {
  imageId: string;
  userId: string;
  imageOriginalName: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ApiGatewayWebSocket implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private authServiceClient: AuthServiceClient;
  private readonly logger = new Logger(ApiGatewayWebSocket.name);

  private connectedUsers = new Map<string, Socket>();

  private queueEvents: QueueEvents;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.authServiceClient =
      this.authClient.getService<AuthServiceClient>('AuthService');
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.listenToQueueEvents();

    server.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization;

        if (!token) return next(new Error('Unauthorized: Token is missing'));

        const accessToken = token.startsWith('Bearer ')
          ? token.split(' ')[1]
          : token;

        const response = await lastValueFrom(
          this.authServiceClient.validateAccessToken({ accessToken }),
        );

        if (!response.isValid) {
          return next(new Error('Unauthorized: Invalid token'));
        }

        const userId = response.userId;

        if (!userId) return next(new Error('Unauthorized: User not found'));

        socket.data.userId = userId;
        this.connectedUsers.set(userId, socket);
        this.logger.log(`User ${userId} connected`);

        socket.on('disconnect', () => {
          this.connectedUsers.delete(userId);
          this.logger.log(`User ${userId} disconnected`);
        });

        next();
      } catch (err) {
        return next(new Error('Unauthorized: ' + err.message));
      }
    });
  }

  /**
   * Отправка статуса обработки изображения конкретному пользователю
   */
  notifyImageChange(userId: string, data: NotifyImageChangeData) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('image-processing', data);
    } else {
      this.logger.warn(`Socket for user ${userId} not found`);
    }
  }

  /**
   * Слушаем очередь BullMQ и рассылаем обновления пользователям
   */
  private listenToQueueEvents() {
    this.queueEvents = new QueueEvents('image-processing', {
      connection: {
        host: this.configService.getOrThrow('REDIS_HOST'),
        port: Number(this.configService.getOrThrow('REDIS_PORT')),
      },
    });

    this.queueEvents.on(
      'progress',
      (event: { jobId: string; data: NotifyImageChangeData }) => {
        const { jobId, data } = event;
        this.logger.log(`Progress for job ${jobId}: ${JSON.stringify(data)}`);
        this.notifyImageChange(data.userId, data);
      },
    );

    this.queueEvents.on('completed', (event) => {
      const { jobId, returnvalue } = event;
      this.logger.log(`Job ${jobId} completed: ${JSON.stringify(returnvalue)}`);
    });
  }
}
