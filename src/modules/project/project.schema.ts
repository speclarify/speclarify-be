import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Organization } from '../organization/organization.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Organization | Types.ObjectId;

  @Prop({ required: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, maxlength: 40 })
  path: string;

  @Prop({ required: false, maxlength: 500 })
  photo?: string;

  @Prop({ required: true, maxlength: 255 })
  description: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
