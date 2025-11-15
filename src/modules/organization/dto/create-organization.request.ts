import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class CreateOrganizationRequest {
  @ApiProperty({
    description: 'The name of the organization',
    maxLength: 40,
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  @MaxLength(40)
  name: string;

  @ApiProperty({
    description: 'The contact email of the organization',
    maxLength: 80,
  })
  @IsEmail()
  @MaxLength(80)
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
