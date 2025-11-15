import { UserRole } from '../user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  photo?: string;

  @ApiProperty({
    description: 'Organization created at',
  })
  createdAt: Date;

  @ApiProperty()
  isVerified: boolean;
}
