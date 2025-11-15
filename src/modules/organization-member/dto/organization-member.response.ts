import { UserResponse } from '../../user/dto/user.response';
import { OrganizationRole } from '../organization-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationMemberResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: UserResponse;

  @ApiProperty()
  role: OrganizationRole;

  @ApiProperty()
  joinedAt: Date;
}
