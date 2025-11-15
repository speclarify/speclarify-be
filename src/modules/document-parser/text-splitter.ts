import { TokenTextSplitter } from 'langchain/text_splitter';

export class TextSplitter extends TokenTextSplitter {
  private static instance: TextSplitter;

  private constructor() {
    super({
      encodingName: 'gpt2',
      chunkSize: 400,
      chunkOverlap: 200,
    });
  }

  public static getInstance(): TextSplitter {
    if (!TextSplitter.instance) {
      TextSplitter.instance = new TextSplitter();
    }

    return TextSplitter.instance;
  }
}
