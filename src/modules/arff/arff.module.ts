import { Module } from '@nestjs/common';
import { ArffController } from './arff.controller';
import { ArffService } from './arff.service';

@Module({
  imports: [],
  controllers: [ArffController],
  providers: [ArffService],
  exports: [],
})
export class ArffModule {}
