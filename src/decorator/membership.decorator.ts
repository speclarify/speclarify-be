import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './public.decorator';
import { OrganizationMemberDocument } from '../modules/organization-member/organization-member.schema';

export const Membership = () =>
  createParamDecorator(
    (
      data: unknown,
      context: ExecutionContext,
    ): OrganizationMemberDocument[] | null => {
      const request = context.switchToHttp().getRequest();
      const membership = request.membership;
      if (membership?.[Symbol.for(IS_PUBLIC_KEY)]) {
        return null;
      }

      return membership;
    },
  )();
