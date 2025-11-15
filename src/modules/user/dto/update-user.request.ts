import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequest {
  @ApiProperty({ required: true, type: 'string', maxLength: 80 })
  @MaxLength(80)
  @IsString()
  name: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  photo?: string;

  @ApiProperty({ required: true, type: 'string', maxLength: 80 })
  @IsEmail()
  @MaxLength(80)
  email: string;
}
