import { Injectable } from '@nestjs/common';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { RequirementsParserOutputParser } from '../../output-parsers/requirements-parser.output-parser';
import { CreateRequirementRequest } from '../requirement/dto/create-requirement.request';
import { LLM } from './llm';

@Injectable()
export class RequirementsParserChain {
  public async handle(text: string): Promise<CreateRequirementRequest[]> {
    const parser = RequirementsParserOutputParser.getInstance();

    const prompt = PromptTemplate.fromTemplate(
      `
        Your task is to analyze the provided text. Begin by determining if this text is an excerpt from a Software Requirements Specification (SRS) document.
        Follow these guidelines for your response:

        1. If the text is not an excerpt from a SRS document, or if it's not clear whether it is, immediately return an empty array: "[]".
        2. If the text is an excerpt from a SRS document, continue with determining if te excerpt contains any software requirements.
        3. If the text doesn't contain any valid software requirement, immediately return an empty array: "[]"
        4. If the text includes valid software requirements, extract the requirement statements and format them as an array of JSON objects.
        5. Your response must be a valid JSON array. This means it should start with '[' and end with ']'.
        6. Include only the requirement statements found in the SRS text. Do not add any extra text or elements not present in the original document.
        7. If no software requirements are identified in the SRS document, return an empty array: "[]".
        8. Make sure they the requirements that you have identified are valid functional or non-functional requirements.
        9. If the requirements you have identified are not valid functional or non-functional requirements, do not include them in your response.
        10. Excerpts are taken without regard to sentence boundaries. You must ignore any incomplete sentences at the beginning or end of the excerpt.
        11. If the "description" of an identified requirement is not a complete sentence, do not include it in your response.
        12. Requirements are mandatory binding provisions and use 'shall', 'should', or 'must'.
        13. Do not include any requirement that does not use any of 'shall', 'should', or 'must'.
        {format_instructions}
        
        The text excerpt: {text}
        `,
    );

    const llm = LLM.getInstance();
    const chain = RunnableSequence.from([prompt, llm, parser]);

    const result = await chain.invoke(
      {
        text: text,
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [],
      },
    );

    return result
      .filter(
        (item) =>
          item.description.split(' ').length > 5 &&
          (item.description.toLowerCase().includes('shall') ||
            item.description.toLowerCase().includes('should') ||
            item.description.toLowerCase().includes('must')),
      )
      .map(
        (item) =>
          new CreateRequirementRequest(item.identifier, item.description),
      );
  }
}
