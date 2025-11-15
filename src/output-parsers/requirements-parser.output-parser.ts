import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const schema = z.array(
  z.object({
    identifier: z
      .string()
      .describe(
        'Each requirement should be uniquely identified (i.e., number, name tag, mnemonic). ' +
          'Example: "DEMO-SRS-89", don not include "[", "]", or any other characters.',
      ),
    description: z
      .string()
      .describe(
        'This description provides a means for distinguishing between requirements and the attributes ' +
          'of those requirements (conditions, assumptions and constraints).',
      ),
  }),
);

export class RequirementsParserOutputParser extends StructuredOutputParser<
  typeof schema
> {
  private static instance: RequirementsParserOutputParser;

  private constructor() {
    super(schema);
  }

  public static getInstance(): RequirementsParserOutputParser {
    if (!RequirementsParserOutputParser.instance) {
      RequirementsParserOutputParser.instance =
        new RequirementsParserOutputParser();
    }
    return RequirementsParserOutputParser.instance;
  }
}
