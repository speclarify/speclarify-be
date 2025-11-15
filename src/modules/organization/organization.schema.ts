import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema()
export class Organization {
  @Prop({ required: true, maxlength: 40 })
  name: string;

  @Prop({ required: true, maxlength: 80 })
  email: string;

  @Prop({ required: true, maxlength: 40, unique: true })
  path: string;

  @Prop({ required: false, maxlength: 500 })
  photo?: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, maxlength: 255 })
  address: string;

  @Prop({ required: true, maxlength: 30 })
  phoneNumber: string;

  @Prop({ required: true, maxlength: 255 })
  website: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
