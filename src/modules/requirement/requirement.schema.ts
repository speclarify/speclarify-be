import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from '../project/project.schema';
import { RequirementType } from './enum/requirement-type.enum';
import { Priority } from './enum/priority.enum';

export type RequirementDocument = HydratedDocument<Requirement>;

@Schema()
export class Requirement {
  @Prop({ required: true, maxlength: 100 })
  identifier: string;

  @Prop({ required: true, maxlength: 1000 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Project | Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: String, enum: Priority, required: true })
  priority: Priority;

  @Prop({ type: String, enum: RequirementType, required: true })
  type: RequirementType;
}

export const RequirementSchema = SchemaFactory.createForClass(Requirement);
