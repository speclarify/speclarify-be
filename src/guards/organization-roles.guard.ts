import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORGANIZATION_ROLES_KEY } from '../decorator/organization-roles.decorator';
import { OrganizationRole } from '../modules/organization-member/organization-role.enum';
import { OrganizationService } from '../modules/organization/organization.service';
import { OrganizationMemberService } from '../modules/organization-member/organization-member.service';
import { UserDocument } from '../modules/user/user.schema';
import { UserRole } from '../modules/user/user-role.enum';

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationMemberService: OrganizationMemberService,
    private organizationService: OrganizationService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(
      ORGANIZATION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserDocument | null;
    const orgPath = request.params.orgPath;

    if (user && orgPath) {
      if (user.role === UserRole.Admin) {
        return true;
      }
      const org = await this.organizationService.findByPath(orgPath);
      if (org) {
        const member =
          await this.organizationMemberService.getMemberByUserAndOrganization(
            user._id,
            org._id,
          );
        if (member) {
          return requiredRoles.includes(member.role);
        }
      }
    }

    return false;
  }
}
