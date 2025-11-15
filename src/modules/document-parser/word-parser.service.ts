import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DocumentCreatedPayload } from './payload/document-created.payload';
import { ParseRequirementsRequestPayload } from './payload/parse-requirements-request.payload';
import { TextSplitter } from './text-splitter';
import mammoth from 'mammoth';

@Injectable()
export class WordParserService {
  constructor(private eventEmitter: EventEmitter2) {}

  @OnEvent('DocumentParseRequest.application/msword')
  @OnEvent(
    'DocumentParseRequest.application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  public async parse(payload: DocumentCreatedPayload): Promise<void> {
    try {
      const data = await mammoth.extractRawText({ path: payload.file.path });

      const splitter = TextSplitter.getInstance();

      const documents = await splitter.createDocuments([data.value]);

      const outgoingPayload = new ParseRequirementsRequestPayload(
        payload.projectId,
        documents,
      );

      this.eventEmitter.emit('ParseRequirementsRequest', outgoingPayload);
    } catch (error) {
      throw new InternalServerErrorException('Error while parsing Word file');
    }
  }
}
