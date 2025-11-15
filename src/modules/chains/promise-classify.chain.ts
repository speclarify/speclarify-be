import { Injectable } from '@nestjs/common';
import { RunnableSequence } from '@langchain/core/runnables';
import { FewShotPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { EnumerationOutputParser } from '../../output-parsers/enumeration-output.parser';
import { LLM } from './llm';
import { SemanticSimilarityExampleSelector } from '@langchain/core/example_selectors';
import { OpenAIEmbeddings } from '@langchain/openai';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { RequirementType } from '../requirement/enum/requirement-type.enum';

@Injectable()
export class PromiseClassifyChain {
  public async execute(
    requirement: string,
    examples: {
      input: string;
      output: string;
    }[],
  ): Promise<RequirementType> {
    const parser = new EnumerationOutputParser(RequirementType);

    const prompt = PromptTemplate.fromTemplate(
      `
      Your task is to analyze the provided software requirement.
      Determine the class of the requirement based on the following categories:
      
      {format_instructions}
      All requirements not labeled with “F” are non-functional with the following types: A=Availability, L = Legal, LF = Look and feel, MN = Maintainability, O = Operational, PE = Performance, SC = Scalability, SE = Security, US = Usability, FT = Fault tolerance, and PO = Portability
      
      Does the requirement specify a function that the system must perform, or a system feature that the system must have?
          Yes-> Functional
          No -> Continue to the next question
      
      Classify functional requirements as "Functional", and non-functional requirements as one of the following:
      
      Is the requirement based on compliance with legal, regulatory, or contractual obligations?
          Yes -> Legal
          No -> Continue to the next question
      
      Does the requirement describe the visual design, theme, branding, or user interface aesthetics?
          Yes -> Look and Feel
          No -> Continue to the next question
      
      Does the requirement specify the deployment environment, software dependencies, or integration with other systems?
          Yes -> Operational
          No -> Continue to the next question
      
      Does the requirement discuss the system's ability to handle growth in workload (data volume, user load, transaction frequency) without compromising performance?
          Yes -> Scalability
          No -> Continue to the next question
      
      Does the requirement pertain to safeguarding information and data, ensuring appropriate access, and protecting against unauthorized modifications or attacks?
          Yes -> Security
          No -> Continue to the next question
      
      Does the requirement involve the system's ability to be utilized effectively, efficiently, and satisfactorily by specific users?
          Yes -> Usability
          No -> Continue to the next question
      
      Does the requirement relate to the system's performance relative to the amount of resources used under stated conditions (response times, resource utilization, capacity)?
          Yes -> Performance
          No -> Continue to the next question
      
      Does the requirement address the system's ability to operate as intended despite hardware or software faults?
          Yes -> Fault Tolerance
          No -> Continue to the next question
      
      Does the requirement involve the system's ability to be transferred effectively and efficiently to different environments (hardware, software, operational)?
          Yes -> Portability
          No -> Continue to the next question
      
      Does the requirement address the system's ability to be modified by maintainers (modularity, reusability, analysability, modifiability, testability)?
          Yes -> Maintainability
          No -> Continue to the next question
      
      Does the requirement address the system's operational and accessible state when required for use, including maturity, fault tolerance, and recoverability?
          Yes -> Availability
          No -> The requirement does not fit any of the provided categories
      
      {format_instructions}
      
      {few_shot_suffix}
    `,
    );

    const exampleSelector =
      await SemanticSimilarityExampleSelector.fromExamples(
        examples,
        new OpenAIEmbeddings(),
        HNSWLib,
        { k: 3 },
      );

    const dynamicPrompt = new FewShotPromptTemplate({
      exampleSelector,
      examplePrompt: PromptTemplate.fromTemplate(
        'Question: {input}\nAnswer: {output}',
      ),
      suffix: 'Input: {requirement}\nOutput:',
      inputVariables: ['requirement'],
    });

    const fewShotSuffix = await dynamicPrompt.format({
      requirement: requirement,
    });

    const llm = LLM.getInstance();

    const chain = RunnableSequence.from([prompt, llm, parser]);

    const result = await chain.invoke(
      {
        format_instructions: parser.getFormatInstructions(),
        few_shot_suffix: fewShotSuffix,
      },
      {
        callbacks: [],
      },
    );

    return result as RequirementType;
  }
}
