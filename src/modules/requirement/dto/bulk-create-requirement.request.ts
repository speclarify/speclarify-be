import { CreateRequirementRequest } from './create-requirement.request';
import { Types } from 'mongoose';

export class BulkCreateRequirementRequest {
  projectId: Types.ObjectId;
  requirements: CreateRequirementRequest[];

  constructor(
    projectId: Types.ObjectId,
    requirements: CreateRequirementRequest[],
  ) {
    this.projectId = projectId;
    this.requirements = requirements;
  }
}
