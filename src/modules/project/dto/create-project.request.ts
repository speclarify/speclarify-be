import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateProjectRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-zA-Z0-9\s]+$/)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description:
      'The photo of the organization. Accepted formats are JPG and PNG.',
    type: 'string',
    format: 'binary',
    required: false,
  })
  photo?: string;
}
