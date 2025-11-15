import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { NotificationStatus } from '../enum/notification-status.enum';

export class UpdateNotificationStatusRequest {
  @ApiProperty({ required: true, enum: NotificationStatus, type: 'enum' })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;
}
