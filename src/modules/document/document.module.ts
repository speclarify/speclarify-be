import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './document.schema';
import { DocumentRepository } from './document.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Document.name,
        schema: DocumentSchema,
      },
    ]),
    ProjectModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository],
})
export class DocumentModule {}
