import { ApiProperty } from '@nestjs/swagger';
import { RequirementDocument } from '../requirement.schema';
import { Priority } from '../enum/priority.enum';
import { RequirementType } from '../enum/requirement-type.enum';

export class RequirementResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  identifier: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: 'enum', enum: Priority })
  priority: Priority;

  @ApiProperty({ type: 'enum', enum: RequirementType })
  type: RequirementType;

  private constructor() {}

  public static fromRequirement(
    requirement: RequirementDocument,
  ): RequirementResponse {
    const response = new RequirementResponse();
    response.id = requirement._id.toHexString();
    response.description = requirement.description;
    response.identifier = requirement.identifier;
    response.createdAt = requirement.createdAt;
    response.priority = requirement.priority;
    response.type = requirement.type;
    return response;
  }

  public static fromRequirements(
    requirements: RequirementDocument[],
  ): RequirementResponse[] {
    return requirements.map((requirement) =>
      RequirementResponse.fromRequirement(requirement),
    );
  }
}
