import { Types } from 'mongoose';

export class DocumentCreatedPayload {
  projectId: Types.ObjectId;
  file: Express.Multer.File;

  constructor(projectId: Types.ObjectId, file: Express.Multer.File) {
    this.projectId = projectId;
    this.file = file;
  }
}
