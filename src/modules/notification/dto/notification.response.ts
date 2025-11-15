import { NotificationStatus } from '../enum/notification-status.enum';
import { NotificationType } from '../enum/notification-type';

export class NotificationResponse {
  id: string;

  content: string;

  status: NotificationStatus;

  type: NotificationType;

  createdAt: Date;
}
