import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { GetAllNotificationsRequest } from './dto/get-all-notifications.request';
import { UserDocument } from '../user/user.schema';
import { PageResponse } from '../../dto/page.response';
import { NotificationStatus } from './enum/notification-status.enum';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name) private model: Model<Notification>,
  ) {}

  public async getAll(
    query: GetAllNotificationsRequest,
    user: UserDocument,
  ): Promise<PageResponse<NotificationDocument>> {
    const filter: FilterQuery<NotificationDocument> = {
      user: user._id,
      status: query.status,
      type: query.type,
    };

    const count = await this.model.find(filter).countDocuments().exec();

    const notifications = await this.model
      .find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort({ createdAt: -1 })
      .exec();

    return new PageResponse<NotificationDocument>(
      notifications,
      count,
      query.pageNumber,
      query.pageSize,
    );
  }

  public async markAsRead(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
    status: NotificationStatus,
  ): Promise<void> {
    await this.model
      .updateMany({ _id: notificationId, user: userId }, { status })
      .exec();
  }

  public async markAllAsRead(userId: Types.ObjectId): Promise<void> {
    await this.model
      .updateMany({ user: userId }, { status: NotificationStatus.Read })
      .exec();
  }
}
