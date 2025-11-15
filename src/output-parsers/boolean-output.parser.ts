import {
  BaseOutputParser,
  OutputParserException,
} from '@langchain/core/output_parsers';
import { SerializedNotImplemented } from '@langchain/core/load/serializable';

export class BooleanOutputParser extends BaseOutputParser<boolean> {
  lc_namespace: string[];

  constructor() {
    super();

    Object.defineProperty(this, 'lc_namespace', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ['langchain', 'output_parsers', 'boolean'],
    });
  }

  public static lc_name(): string {
    return 'BooleanOutputParser';
  }

  public toJSON(): SerializedNotImplemented {
    return this.toJSONNotImplemented();
  }

  public parse(text: string): Promise<boolean> {
    if (text.trim() === 'true') {
      return Promise.resolve(true);
    } else if (text.trim() === 'false') {
      return Promise.resolve(false);
    }
    throw new OutputParserException('Invalid boolean value: ' + text);
  }

  public getFormatInstructions(): string {
    return 'The output must be either "true" or "false". No context should be added.';
  }
}
