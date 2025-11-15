import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class UpdateOrganizationRequest {
  @ApiProperty({
    description: 'The name of the organization',
    maxLength: 40,
    minLength: 1,
    required: true,
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  name: string;

  @ApiProperty({
    description: 'The contact email of the organization',
    maxLength: 80,
    minLength: 1,
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'The photo of the organization. Accepted formats are JPG and PNG.',
    type: 'string',
    format: 'binary',
    required: false,
  })
  photo?: string;

  @ApiProperty({
    description: 'The address of the organization',
  })
  @IsString()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    description: 'The phone number of the organization',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The website of the organization',
  })
  @IsUrl()
  website: string;
}
