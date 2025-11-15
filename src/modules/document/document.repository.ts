import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Document, DocumentDocument } from './document.schema';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
  ) {}

  public async create(document: Document) {
    return await this.documentModel.create(document);
  }

  public async findAll(projectId: Types.ObjectId): Promise<DocumentDocument[]> {
    return await this.documentModel.find({ project: projectId }).exec();
  }

  public async findById(
    documentId: Types.ObjectId,
  ): Promise<DocumentDocument | null> {
    return await this.documentModel.findById(documentId).exec();
  }

  public async delete(documentId: string) {
    return await this.documentModel.findByIdAndDelete(documentId).exec();
  }
}
