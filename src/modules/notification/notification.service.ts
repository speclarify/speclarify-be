import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { UserDocument } from '../user/user.schema';
import { GetAllNotificationsRequest } from './dto/get-all-notifications.request';
import { PageResponse } from '../../dto/page.response';
import { NotificationResponse } from './dto/notification.response';
import { NotificationDocument } from './notification.schema';
import { UpdateNotificationStatusRequest } from './dto/update-notification-status.request';
import { Types } from 'mongoose';
import { UserRole } from '../user/user-role.enum';

@Injectable()
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  public async getAll(
    query: GetAllNotificationsRequest,
    user: UserDocument,
  ): Promise<PageResponse<NotificationResponse>> {
    const response = await this.notificationRepository.getAll(query, user);

    return PageResponse.mapItems(response, (item: NotificationDocument) =>
      this.responseFromNotification(item),
    );
  }

  private responseFromNotification(
    notification: NotificationDocument,
  ): NotificationResponse {
    const response = new NotificationResponse();
    response.id = notification.id;
    response.content = notification.content;
    response.type = notification.type;
    response.status = notification.status;
    response.createdAt = notification.createdAt;
    return response;
  }

  public async updateStatus(
    request: UpdateNotificationStatusRequest,
    user: UserDocument,
    id: string,
  ): Promise<void> {
    await this.notificationRepository.markAsRead(
      Types.ObjectId.createFromHexString(id),
      user._id,
      request.status,
    );
  }

  public async markAllAsRead(user: UserDocument): Promise<void> {
    await this.notificationRepository.markAllAsRead(user._id);
  }
}
