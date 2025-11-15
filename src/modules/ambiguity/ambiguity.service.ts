import { Injectable } from '@nestjs/common';
import { AmbiguityRepository } from './ambiguity.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Ambiguity } from './ambiguity.schema';
import { AmbiguityIdentificationChain } from '../chains/ambiguity-identification-chain.service';
import { RequirementService } from '../requirement/requirement.service';
import { ConcurrencyLimit } from '../../util/concurrency-limit';
import { RequirementDocument } from '../requirement/requirement.schema';
import { AmbiguityParserResponse } from '../../output-parsers/dto/ambiguity-parser.response';

@Injectable()
export class AmbiguityService {
  private constructor(
    private ambiguityRepository: AmbiguityRepository,
    private ambiguityIdentificationChain: AmbiguityIdentificationChain,
    private requirementService: RequirementService,
  ) {}

  public async get(requirementId: string) {
    const objectId = Types.ObjectId.createFromHexString(requirementId);
    const ambiguity =
      await this.ambiguityRepository.findByRequirementId(objectId);

    return new AmbiguityParserResponse(
      ambiguity !== null,
      ambiguity?.reason ?? null,
      ambiguity?.suggestions ?? [],
    );
  }

  @OnEvent('IdentifyAmbiguityRequest')
  public async onIdentifyAmbiguityRequest(id: Types.ObjectId): Promise<void> {
    const requirement = await this.requirementService.findById(id);

    if (!requirement) {
      throw new Error('Requirement not found');
    }

    const limit = ConcurrencyLimit.getInstance();

    await limit(() => this.identifyAmbiguity(requirement));
  }

  private async identifyAmbiguity(
    requirement: RequirementDocument,
  ): Promise<void> {
    const ambiguityParserResponse =
      await this.ambiguityIdentificationChain.execute(requirement);

    if (ambiguityParserResponse.isAmbiguous && ambiguityParserResponse.reason) {
      const ambiguity = new Ambiguity();
      ambiguity.requirement = requirement._id;
      ambiguity.reason = ambiguityParserResponse.reason;
      ambiguity.suggestions = ambiguityParserResponse.suggestions;
      await this.ambiguityRepository.save(ambiguity);
    }
  }
}
