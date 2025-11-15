import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyEmailRequest {
  @ApiProperty()
  @IsString()
  @Length(36, 36)
  code: string;
}
