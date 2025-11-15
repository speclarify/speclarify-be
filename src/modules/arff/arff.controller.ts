import {
  Body,
  Controller,
  Header,
  Post,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../../decorator/public.decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ArffService } from './arff.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatedFile } from '../../decorator/validated-file.decorator';
import { Express } from 'express';

class ArffParseRequest {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: string;
}

@Public()
@Controller('arff')
@ApiTags('ARFF')
@ApiBearerAuth()
export class ArffController {
  constructor(private readonly arffService: ArffService) {}

  @Post('parse')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="PromiseResult.xlsx"')
  public async parse(
    @ValidatedFile(true, 100, 'application/octet-stream')
    file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() body: ArffParseRequest,
  ): Promise<StreamableFile> {
    return await this.arffService.parse(file);
  }
}
