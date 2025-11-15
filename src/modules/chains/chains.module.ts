import { Global, Module } from '@nestjs/common';
import { RequirementPriorityChain } from './requirement-priority.chain';
import { RequirementsParserChain } from './requirements-parser.chain';
import { RequirementValidatorChain } from './requirement-validator.chain';
import { RequirementClassifyChain } from './requirement-classify.chain';
import { AmbiguityIdentificationChain } from './ambiguity-identification-chain.service';

@Global()
@Module({
  providers: [
    RequirementsParserChain,
    RequirementValidatorChain,
    RequirementPriorityChain,
    RequirementClassifyChain,
    AmbiguityIdentificationChain,
  ],
  exports: [
    RequirementsParserChain,
    RequirementValidatorChain,
    RequirementPriorityChain,
    RequirementClassifyChain,
    AmbiguityIdentificationChain,
  ],
})
export class ChainsModule {}
