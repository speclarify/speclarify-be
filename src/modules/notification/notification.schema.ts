import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotificationStatus } from './enum/notification-status.enum';
import { NotificationType } from './enum/notification-type';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'Notification', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, maxlength: 500 })
  content: string;

  @Prop({ required: true, type: String, enum: NotificationStatus })
  status: NotificationStatus;

  @Prop({ required: true, type: String, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
