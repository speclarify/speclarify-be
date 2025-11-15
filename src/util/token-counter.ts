export class TokenCounter {
  private static instance: TokenCounter;
  private totalTokenCount: number = 0;
  private tpm: number = 0;

  private constructor() {
    setInterval(() => {
      this.tpm = 0;
    }, 60 * 1000);
  }

  public static add(amount: number): void {
    TokenCounter.getInstance().totalTokenCount += amount;
    TokenCounter.getInstance().tpm += amount;
  }

  public static get(): number {
    return TokenCounter.getInstance().totalTokenCount;
  }

  public static getTPM(): number {
    return TokenCounter.getInstance().tpm;
  }

  private static getInstance(): TokenCounter {
    if (!TokenCounter.instance) {
      TokenCounter.instance = new TokenCounter();
    }

    return TokenCounter.instance;
  }
}
