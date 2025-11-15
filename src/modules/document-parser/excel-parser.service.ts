import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DocumentCreatedPayload } from './payload/document-created.payload';
import { RequirementType } from '../requirement/enum/requirement-type.enum';
import ExcelJS from 'exceljs';
import { BulkCreateRequirementRequest } from '../requirement/dto/bulk-create-requirement.request';
import { CreateRequirementRequest } from '../requirement/dto/create-requirement.request';

@Injectable()
export class ExcelParserService {
  constructor(private eventEmitter: EventEmitter2) {}

  @OnEvent(
    'DocumentParseRequest.application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @OnEvent('DocumentParseRequest.application/vnd.ms-excel')
  @OnEvent('DocumentParseRequest.text/csv')
  public async parse(payload: DocumentCreatedPayload): Promise<void> {
    try {
      const buffer: Buffer = Buffer.from(payload.file.buffer);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
      const requests: CreateRequirementRequest[] = [];
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new InternalServerErrorException('No worksheet found');
      }
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }
        const [, identifier, description, type] = row.values as [
          void,
          string,
          string,
          RequirementType,
        ];

        requests.push({
          identifier,
          description,
          type,
        });
      });

      const outgoingPayload = new BulkCreateRequirementRequest(
        payload.projectId,
        requests,
      );

      this.eventEmitter.emit('BulkCreateRequirementRequest', outgoingPayload);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error while parsing excel file');
    }
  }
}
