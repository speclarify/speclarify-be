import { Injectable } from '@nestjs/common';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { BooleanOutputParser } from '../../output-parsers/boolean-output.parser';
import { LLM } from './llm';

@Injectable()
export class RequirementValidatorChain {
  public async execute(requirement: string): Promise<boolean> {
    const parser = new BooleanOutputParser();

    const prompt = PromptTemplate.fromTemplate(
      `
      Your task is to analyze the provided text.
      Simply determine if this text is a valid software requirement.
      A valid software requirement must have complete sentences.
      
      {format_instructions}
      
      Question: Site adaptation requirements
      Answer: false
      
      Question: The application shall allow users to paste an HTML content 
      copied from MS Word, Excel or other application into the text description of the selected requirement.
      Answer: true
      
      Question: {text}
      Answer:
    `,
    );

    const llm = LLM.getInstance();

    const chain = RunnableSequence.from([prompt, llm, parser]);

    return await chain.invoke(
      {
        text: requirement.toString(),
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [],
      },
    );
  }
}
