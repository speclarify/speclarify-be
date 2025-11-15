import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VerificationCodeDocument = HydratedDocument<VerificationCode>;

@Schema()
export class VerificationCode {
  @Prop({ required: true, maxlength: 36 })
  code: string;

  @Prop({ required: true, maxlength: 80 })
  email: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const VerificationCodeSchema =
  SchemaFactory.createForClass(VerificationCode);
