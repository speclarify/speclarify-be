import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllOrganizationMembersQuery {
  @ApiProperty({
    description: 'Search by name',
    maxLength: 40,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search: string = '';

  @ApiProperty({
    description: 'Page number starting from 0',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageNumber: number = 1;

  @ApiProperty({
    description: 'Page size',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageSize: number = 10;
}
