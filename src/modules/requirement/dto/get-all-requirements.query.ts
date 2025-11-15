import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllRequirementsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search: string = '';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageNumber: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageSize: number = 10;
}
