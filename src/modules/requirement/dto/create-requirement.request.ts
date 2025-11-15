import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RequirementType } from '../enum/requirement-type.enum';

export class CreateRequirementRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  identifier: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ enum: RequirementType, type: 'enum' })
  @IsOptional()
  @IsEnum(RequirementType)
  type?: RequirementType;

  constructor(identifier: string, description: string, type?: RequirementType) {
    this.identifier = identifier;
    this.description = description;
    this.type = type;
  }

  public toString(): string {
    return `Identifier: ${this.identifier}\nDescription${this.description}`;
  }
}
