import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { Priority } from '../enum/priority.enum';
import { RequirementType } from '../enum/requirement-type.enum';

export class UpdateRequirementRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  identifier: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ type: 'enum', enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ type: 'enum', enum: RequirementType })
  @IsEnum(RequirementType)
  type: RequirementType;
}
