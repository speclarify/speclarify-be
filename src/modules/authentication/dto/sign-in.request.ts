import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class SignInRequest {
  @ApiProperty()
  @IsEmail()
  @MaxLength(80)
  public email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  public password: string;
}
