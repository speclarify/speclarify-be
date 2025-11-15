import { Global, Module } from '@nestjs/common';
import { FileService } from './file.service';

@Global()
@Module({
  controllers: [],
  imports: [],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
