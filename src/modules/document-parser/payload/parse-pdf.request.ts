import { ApiProperty } from '@nestjs/swagger';

export class ParsePdfRequest {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: string;
}
