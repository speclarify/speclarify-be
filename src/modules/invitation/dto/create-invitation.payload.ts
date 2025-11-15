import { OrganizationRole } from '../../organization-member/organization-role.enum';
import { Types } from 'mongoose';

export class CreateInvitationPayload {
  email: string;
  organizationId: Types.ObjectId;
  role: OrganizationRole;
  organizationName: string;
}
