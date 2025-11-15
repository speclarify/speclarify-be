import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from './user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, maxlength: 80 })
  email: string;

  @Prop({ required: true, maxlength: 72 })
  password: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ type: String, required: false })
  photo: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
