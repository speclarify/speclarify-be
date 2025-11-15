import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES_KEY } from '../decorator/user-roles.decorator';
import { UserRole } from '../modules/user/user-role.enum';
import { UserDocument } from '../modules/user/user.schema';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      USER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user as
      | UserDocument
      | undefined;

    return (
      user !== undefined && requiredRoles.some((role) => user.role === role)
    );
  }
}
