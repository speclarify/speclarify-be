import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../modules/user/user.schema';
import { IS_PUBLIC_KEY } from './public.decorator';

export const CurrentUser = () =>
  createParamDecorator(
    (data: unknown, context: ExecutionContext): UserDocument | null => {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (user?.[Symbol.for(IS_PUBLIC_KEY)]) {
        return null;
      }

      return user;
    },
  )();
