import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema()
export class RefreshToken {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  token: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
