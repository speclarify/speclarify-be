import { Injectable } from '@nestjs/common';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { EnumerationOutputParser } from '../../output-parsers/enumeration-output.parser';
import { Priority } from '../requirement/enum/priority.enum';
import { LLM } from './llm';

@Injectable()
export class RequirementPriorityChain {
  public async execute(requirement: string): Promise<Priority> {
    const parser = new EnumerationOutputParser(Priority);

    const prompt = PromptTemplate.fromTemplate(
      `
      Your task is to analyze the provided software requirement.
      Strictly determine the priority of the requirement given.
      
      {format_instructions}
      
      Question: The application shall allow users to sort all requirements table columns except the Discussion and Links columns by ascending or descending order.
      Answer:
      High
      
      Question: The application shall allow users to paste an HTML content copied from MS Word, Excel or other application into the text description of the selected requirement.
      Answer:
      High
      
      Question: {text}
      Answer:
    `,
    );

    const llm = LLM.getInstance();

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

    return result as Priority;
  }
}
