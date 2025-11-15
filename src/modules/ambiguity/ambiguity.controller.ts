import { Controller, Get, Param } from '@nestjs/common';
import { ApiParams } from '../../decorator/api-params.decorator';
import { AmbiguityService } from './ambiguity.service';
import { OrganizationRoles } from '../../decorator/organization-roles.decorator';
import { OrganizationRole } from '../organization-member/organization-role.enum';

@Controller(
  'organizations/:orgPath/projects/:projectPath/requirements/:requirementId/ambiguity',
)
export class AmbiguityController {
  constructor(private ambiguityService: AmbiguityService) {}

  @Get()
  @ApiParams('orgPath', 'projectPath', 'requirementId')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async get(@Param('requirementId') requirementId: string) {
    return await this.ambiguityService.get(requirementId);
  }
}
