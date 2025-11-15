import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DocumentCreatedPayload } from './payload/document-created.payload';
import { ParseRequirementsRequestPayload } from './payload/parse-requirements-request.payload';
import { TextSplitter } from './text-splitter';

@Injectable()
export class TextParserService {
  constructor(private eventEmitter: EventEmitter2) {}

  @OnEvent('DocumentParseRequest.text/plain')
  public async parse(payload: DocumentCreatedPayload): Promise<void> {
    try {
      const data = payload.file.buffer.toString('utf-8');
      const splitter = TextSplitter.getInstance();

      const documents = await splitter.createDocuments([data]);

      const outgoingPayload = new ParseRequirementsRequestPayload(
        payload.projectId,
        documents,
      );

      this.eventEmitter.emit('ParseRequirementsRequest', outgoingPayload);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while parsing the .txt file',
      );
    }
  }
}
