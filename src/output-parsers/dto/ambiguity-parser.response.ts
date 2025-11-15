export class AmbiguityParserResponse {
  isAmbiguous: boolean;
  reason: string | null;
  suggestions: string[];

  constructor(
    isAmbiguous: boolean,
    reason: string | null,
    suggestions?: string[],
  ) {
    this.isAmbiguous = isAmbiguous;
    this.reason = reason ?? null;
    this.suggestions = suggestions ?? [];
  }
}
