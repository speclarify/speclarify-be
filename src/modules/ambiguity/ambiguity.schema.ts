import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Requirement } from '../requirement/requirement.schema';

export type AmbiguityDocument = HydratedDocument<Ambiguity>;

@Schema()
export class Ambiguity {
  @Prop({ type: Types.ObjectId, ref: 'Requirement', required: true })
  requirement: Requirement | Types.ObjectId;

  @Prop({ required: true, maxlength: 500 })
  reason: string;

  @Prop([{ type: String, maxlength: 500 }])
  suggestions: string[];

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const AmbiguitySchema = SchemaFactory.createForClass(Ambiguity);
