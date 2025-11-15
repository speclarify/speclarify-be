import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SignUpRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(80)
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  password: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  photo?: string;
}
