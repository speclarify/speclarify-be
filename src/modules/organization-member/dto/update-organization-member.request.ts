import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '../organization-role.enum';

export class UpdateOrganizationMemberRequest {
  @ApiProperty({
    enum: OrganizationRole,
    type: 'enum',
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}
