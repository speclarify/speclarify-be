import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { TextParserService } from './text-parser.service';
import { WordParserService } from './word-parser.service';
import { ExcelParserService } from './excel-parser.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    PdfParserService,
    TextParserService,
    WordParserService,
    ExcelParserService,
  ],
  exports: [],
})
export class DocumentParserModule {}
