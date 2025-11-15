import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponse {
  @ApiProperty({
    description: 'Organization id',
  })
  id: string;

  @ApiProperty({
    description: 'Organization name',
  })
  name: string;

  @ApiProperty({
    description: 'Organization path',
  })
  path: string;

  @ApiProperty({
    description: 'Organization logo url',
    nullable: true,
  })
  photo?: string;

  @ApiProperty({
    description: 'Organization created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Organization address',
  })
  address: string;

  @ApiProperty({
    description: 'Organization phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Organization website',
  })
  website: string;

  @ApiProperty({
    description: 'Organization email',
  })
  email: string;
}
