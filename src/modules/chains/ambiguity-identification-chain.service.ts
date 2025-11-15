import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { CreateRequirementRequest } from '../requirement/dto/create-requirement.request';
import { AmbiguityOutputParser } from '../../output-parsers/ambiuity.output-parser';
import { AmbiguityParserResponse } from '../../output-parsers/dto/ambiguity-parser.response';

@Injectable()
export class AmbiguityIdentificationChain {
  public async execute(
    requirement: CreateRequirementRequest,
  ): Promise<AmbiguityParserResponse> {
    const parser = AmbiguityOutputParser.getInstance();

    const prompt = PromptTemplate.fromTemplate(
      `
      Your task is to analyze the provided software requirement.
      Strictly determine whether this software requirement is ambiguous or not.
      If the requirement is ambiguous, return "true", otherwise return "false".
      
      {format_instructions}
      
      Question: 
      Identifier: DEMO-SRS-90
      Description: The application shall allow users to sort all requirements table columns except the Discussion and
       Links columns by ascending or descending order.
      Answer:
      false
      
      Question: 
      Identifier: DEMO-SRS-116
      Description: The application should somehow enable users to insert some kind of HTML content, which may or may
       not have been copied from various unspecified applications like MS Word or Excel, into the text description of 
       any requirement they happen to choose.
      Answer:
      true
      Question: 
      {text}
      Answer:
    `,
    );

    const llm = new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-3.5-turbo-1106',
      maxConcurrency: 10,
    });

    const chain = RunnableSequence.from([prompt, llm, parser]);

    const result = await chain.invoke(
      {
        text: requirement.toString(),
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [],
      },
    );

    return new AmbiguityParserResponse(
      result.isAmbiguous,
      result.reason,
      result.suggestions,
    );
  }
}
