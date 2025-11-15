import { Document } from '@langchain/core/documents';
import { Types } from 'mongoose';

export class ParseRequirementsRequestPayload {
  projectId: Types.ObjectId;
  documents: Document[];

  constructor(projectId: Types.ObjectId, documents: Document[]) {
    this.projectId = projectId;
    this.documents = documents;
  }
}
