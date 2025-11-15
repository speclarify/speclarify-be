import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequirementController } from './requirement.controller';
import { ProjectModule } from '../project/project.module';
import { Requirement, RequirementSchema } from './requirement.schema';
import { RequirementService } from './requirement.service';
import { RequirementRepository } from './requirement.repository';
import { RequirementsParserService } from './requirements-parser.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Requirement.name, schema: RequirementSchema },
    ]),
    ProjectModule,
  ],
  controllers: [RequirementController],
  providers: [
    RequirementService,
    RequirementRepository,
    RequirementsParserService,
  ],
  exports: [RequirementService],
})
export class RequirementModule {}
