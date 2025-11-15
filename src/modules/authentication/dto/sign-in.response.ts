import { UserResponse } from '../../user/dto/user.response';

export class SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
