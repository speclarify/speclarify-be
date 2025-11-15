import { ChatOpenAI } from '@langchain/openai';

export class LLM {
  private static instance: ChatOpenAI;

  private constructor() {}

  public static getInstance(): ChatOpenAI {
    if (!LLM.instance) {
      LLM.instance = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo-1106',
        maxConcurrency: 8,
      });
    }

    return LLM.instance;
  }
}
