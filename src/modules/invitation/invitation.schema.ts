import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Organization } from '../organization/organization.schema';
import { OrganizationRole } from '../organization-member/organization-role.enum';

export type InvitationDocument = HydratedDocument<Invitation>;

@Schema()
export class Invitation {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true, type: Types.ObjectId, ref: Organization.name })
  organization: Organization | Types.ObjectId;

  @Prop({ type: String, required: true, enum: OrganizationRole })
  role: OrganizationRole;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
