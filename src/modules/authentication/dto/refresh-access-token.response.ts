import { ApiProperty } from '@nestjs/swagger';

export class RefreshAccessTokenResponse {
  @ApiProperty()
  accessToken: string;
}
