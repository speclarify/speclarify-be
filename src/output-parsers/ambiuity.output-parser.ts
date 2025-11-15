import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const schema = z.object({
  isAmbiguous: z
    .boolean()
    .describe(
      "true if the requirement is ambiguous, false if it's not ambiguous.",
    ),
  reason: z
    .string()
    .describe(
      'The reason why the requirement is ambiguous. Can be nul if the requirement is not ambiguous.',
    )
    .nullable(),
  suggestions: z
    .array(z.string().describe('Individual suggestion.'))
    .describe('Suggestions for the requirement. Leave empty if not ambiguous.'),
});

export class AmbiguityOutputParser extends StructuredOutputParser<
  typeof schema
> {
  private static instance: AmbiguityOutputParser;

  private constructor() {
    super(schema);
  }

  public static getInstance(): AmbiguityOutputParser {
    if (!AmbiguityOutputParser.instance) {
      AmbiguityOutputParser.instance = new AmbiguityOutputParser();
    }
    return AmbiguityOutputParser.instance;
  }
}
