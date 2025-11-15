import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectService } from '../project/project.service';
import { FileService } from '../file/file.service';
import { FileType } from '../file/file-type.enum';
import { Document, DocumentDocument } from './document.schema';
import { DocumentCreatedPayload } from '../document-parser/payload/document-created.payload';
import { DocumentRepository } from './document.repository';
import { DocumentResponse } from './dto/document.response';
import { Types } from 'mongoose';

@Injectable()
export class DocumentService {
  constructor(
    private projectService: ProjectService,
    private eventEmitter: EventEmitter2,
    private fileService: FileService,
    private documentRepository: DocumentRepository,
  ) {}

  public async create(
    orgPath: string,
    projectPath: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const project = await this.projectService.findByPath(orgPath, projectPath);

    const payload = new DocumentCreatedPayload(project._id, file);

    const filePath = await this.fileService.uploadMulterFile(
      file,
      FileType.ProjectDocument,
      orgPath,
      projectPath,
    );

    const document = new Document();
    document.name = file.originalname;
    document.path = filePath;
    document.project = project._id;

    await this.documentRepository.create(document);

    this.eventEmitter.emit('DocumentParseRequest.' + file.mimetype, payload);
  }

  public async findAll(
    orgPath: string,
    projectPath: string,
  ): Promise<DocumentResponse[]> {
    const project = await this.projectService.findByPath(orgPath, projectPath);
    const documents = await this.documentRepository.findAll(project._id);
    return await Promise.all(
      documents.map((item) => this.responseFromDocument(item)),
    );
  }

  public async delete(documentId: string): Promise<void> {
    const document = await this.documentRepository.findById(
      Types.ObjectId.createFromHexString(documentId),
    );
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    await this.fileService.delete(document.path);
    await this.documentRepository.delete(documentId);
  }

  private async responseFromDocument(
    item: DocumentDocument,
  ): Promise<DocumentResponse> {
    const response = new DocumentResponse();
    response.id = item._id.toHexString();
    response.createdAt = item.createdAt.toISOString();
    response.name = item.name;
    response.url = await this.fileService.getSignedUrl(item.path);
    return response;
  }
}
