import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ambiguity, AmbiguitySchema } from './ambiguity.schema';
import { RequirementModule } from '../requirement/requirement.module';
import { AmbiguityRepository } from './ambiguity.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ambiguity.name,
        schema: AmbiguitySchema,
      },
    ]),
    RequirementModule,
  ],
  controllers: [],
  providers: [AmbiguityRepository],
  exports: [],
})
export class AmbiguityModule {}
