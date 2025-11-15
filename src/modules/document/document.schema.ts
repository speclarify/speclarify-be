import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Project } from '../project/project.schema';

export type DocumentDocument = HydratedDocument<Document>;

@Schema()
export class Document {
  @Prop({ required: true, ref: Project.name, type: Types.ObjectId })
  project: Project | Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  name: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
