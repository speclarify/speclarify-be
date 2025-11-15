import { IsEnum, IsOptional } from 'class-validator';
import { NotificationStatus } from '../enum/notification-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enum/notification-type';
import { PageRequest } from '../../../dto/page.request';

export class GetAllNotificationsRequest extends PageRequest {
  @ApiProperty({ required: false, enum: NotificationStatus, type: 'enum' })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiProperty({ required: false, enum: NotificationType, type: 'enum' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
