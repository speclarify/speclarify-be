import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Document } from '@langchain/core/documents';
import { RequirementsParserChain } from '../chains/requirements-parser.chain';
import { RequirementValidatorChain } from '../chains/requirement-validator.chain';
import { ConcurrencyLimit } from '../../util/concurrency-limit';
import { CreateRequirementRequest } from './dto/create-requirement.request';
import { BulkCreateRequirementRequest } from './dto/bulk-create-requirement.request';
import { ParseRequirementsRequestPayload } from '../document-parser/payload/parse-requirements-request.payload';

@Injectable()
export class RequirementsParserService {
  constructor(
    private eventEmitter: EventEmitter2,
    private requirementsParserChain: RequirementsParserChain,
    private requirementValidatorChain: RequirementValidatorChain,
  ) {}

  @OnEvent('ParseRequirementsRequest')
  public async onParseRequirementRequest(
    payload: ParseRequirementsRequestPayload,
  ): Promise<void> {
    const limit = ConcurrencyLimit.getInstance();

    const rawResults: CreateRequirementRequest[] = [];

    const parseDocument = async (document: Document) => {
      const documentResult = await this.requirementsParserChain.handle(
        document.pageContent,
      );
      rawResults.push(...documentResult);
    };

    await Promise.all(
      payload.documents.map((document) => limit(() => parseDocument(document))),
    );

    const purgedResults: CreateRequirementRequest[] = [];
    for (const requirement of rawResults) {
      const withSameIdentifier = purgedResults.find(
        (item) => item.identifier === requirement.identifier,
      );
      const withSameDescription = purgedResults.find(
        (item) => item.description === requirement.description,
      );

      if (!withSameIdentifier && !withSameDescription) {
        purgedResults.push(requirement);
        continue;
      }

      if (
        withSameIdentifier &&
        requirement.description.length > withSameIdentifier.description.length
      ) {
        withSameIdentifier.description = requirement.description;
        continue;
      }

      if (
        withSameDescription &&
        requirement.identifier.length > withSameDescription.identifier.length
      ) {
        withSameDescription.identifier = requirement.identifier;
      }
    }

    const validRequirements: CreateRequirementRequest[] = [];

    await Promise.all(
      purgedResults.map((requirement) =>
        limit(() =>
          this.requirementValidatorChain
            .execute(requirement.description)
            .then((valid) => {
              if (valid) {
                validRequirements.push(requirement);
              }
            }),
        ),
      ),
    );

    const outgoingPayload = new BulkCreateRequirementRequest(
      payload.projectId,
      validRequirements,
    );

    this.eventEmitter.emit('BulkCreateRequirementRequest', outgoingPayload);
  }
}
