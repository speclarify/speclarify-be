import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdatePasswordRequest {
  @ApiProperty({ required: true, type: 'string', maxLength: 80 })
  @MaxLength(80)
  @IsString()
  currentPassword: string;

  @ApiProperty({ required: true, type: 'string', maxLength: 80 })
  @MaxLength(80)
  @IsString()
  newPassword: string;
}
