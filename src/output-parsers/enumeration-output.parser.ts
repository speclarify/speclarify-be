import {
  BaseOutputParser,
  OutputParserException,
} from '@langchain/core/output_parsers';
import { SerializedNotImplemented } from '@langchain/core/load/serializable';

type Enum<E> = Record<keyof E, number | string> & { [k: number]: string };

export class EnumerationOutputParser<
  E extends Enum<E>,
> extends BaseOutputParser<number | string> {
  lc_namespace: string[];
  enum: E;

  constructor(enumeration: E) {
    super();
    this.enum = enumeration;

    Object.defineProperty(this, 'lc_namespace', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ['langchain', 'output_parsers', 'enumeration'],
    });
  }

  public static lc_name(): string {
    return 'enumerationOutputParser';
  }

  public toJSON(): SerializedNotImplemented {
    return this.toJSONNotImplemented();
  }

  public parse(text: string): Promise<string | number> {
    const payload = this.trimPrefixes(text.trim()).trim().replace('\n', ' ');
    const value = Object.values(this.enum).find(
      (v) => v.toLowerCase() === payload.toLowerCase(),
    );
    if (value) {
      return Promise.resolve(value);
    }

    throw new OutputParserException(
      `Value is not in enumeration (${Object.values(this.enum).join(', ')}): \ntext=${text}, payload=${payload}`,
    );
  }

  public getFormatInstructions(): string {
    return `The output must be one of the values [${Object.values(this.enum).join(', ')}]. No context should be added.`;
  }

  private trimPrefixes(inputString: string): string {
    const prefixPattern = /^(Answer:|Output:)\s*/i;

    return inputString.replace(prefixPattern, '');
  }
}
