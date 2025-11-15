import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Organization } from '../organization/organization.schema';
import { OrganizationRole } from './organization-role.enum';

export type OrganizationMemberDocument = HydratedDocument<OrganizationMember>;

@Schema()
export class OrganizationMember {
  @Prop({ type: Types.ObjectId, ref: Organization.name, required: true })
  organization: Organization | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: UserDocument | Types.ObjectId;

  @Prop({ type: String, enum: OrganizationRole, required: true })
  role: OrganizationRole;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const OrganizationMemberSchema =
  SchemaFactory.createForClass(OrganizationMember);
