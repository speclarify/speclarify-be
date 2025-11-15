import { Injectable, InternalServerErrorException } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TextSplitter } from './text-splitter';
import { DocumentCreatedPayload } from './payload/document-created.payload';
import { ParseRequirementsRequestPayload } from './payload/parse-requirements-request.payload';

@Injectable()
export class PdfParserService {
  constructor(private eventEmitter: EventEmitter2) {}

  @OnEvent('DocumentParseRequest.application/pdf')
  public async parse(payload: DocumentCreatedPayload): Promise<void> {
    const buffer = payload.file.buffer;

    try {
      const data = await pdfParse(buffer);

      const splitter = TextSplitter.getInstance();

      const documents = await splitter.createDocuments([data.text]);

      const outgoingPayload = new ParseRequirementsRequestPayload(
        payload.projectId,
        documents,
      );

      this.eventEmitter.emit('ParseRequirementsRequest', outgoingPayload);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error while parsing PDF');
    }
  }
}
