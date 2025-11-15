import { Types } from 'mongoose';
import { OrganizationRole } from '../organization-role.enum';

export class CreateOrganizationMemberPayload {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrganizationRole;

  constructor(
    organizationId: Types.ObjectId,
    userId: Types.ObjectId,
    role: OrganizationRole,
  ) {
    this.organizationId = organizationId;
    this.userId = userId;
    this.role = role;
  }
}
