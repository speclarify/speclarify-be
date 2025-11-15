import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { Error, Types } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { RedisService } from '../redis/redis.service';
import * as process from 'process';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
})
export class DispatchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DispatchGateway.name);

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  public afterInit(server: Server): any {
    server.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      this.logger.debug(`Received token: ${token}`);
      if (token && typeof token === 'string') {
        try {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
          });

          const user = await this.userService.findById(
            Types.ObjectId.createFromHexString(payload.sub),
          );

          if (!user) {
            return next(new Error('Authentication error'));
          }

          socket.data = user;

          this.logger.debug(
            `User ${user._id} connected with socket id ${socket.id}`,
          );
          return next();
        } catch (error) {
          this.logger.error(error);
          return next(new Error('Authentication error'));
        }
      }

      return next(new Error('Authentication error'));
    });
    this.logger.log('Notification gateway initialized');
  }

  public async handleConnection(client: Socket): Promise<any> {
    const user = client.data as UserDocument;
    this.logger.debug(
      `User connected with socket id ${client.id} and id ${user._id}`,
    );
    await this.redisService.set(`user:${user._id}:socketId`, client.id);
  }

  public async handleDisconnect(client: Socket): Promise<any> {
    const user = client.data as UserDocument;
    this.logger.debug(
      `User disconnected with socket id ${client.id} and id ${user._id}`,
    );
    await this.redisService.delete(`user:${user._id}:socketId`);
  }

  public async dispatchAction(
    userId: string,
    actionType: string,
    data: any,
  ): Promise<void> {
    const socketId = await this.redisService.get(`user:${userId}:socketId`);
    if (socketId) {
      this.logger.debug(
        `Dispatching action of type ${actionType} for user ${userId} with socket id ${socketId}.`,
      );
      this.server.to(socketId).emit('DISPATCH_ACTION', {
        type: actionType,
        data,
      });
    }

    this.logger.error(`User ${userId} is not connected`);
  }
}
