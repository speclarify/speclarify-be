import { LimitFunction, pLimit } from './plimit';

export class ConcurrencyLimit {
  private static instance: LimitFunction;

  private constructor() {}

  public static getInstance(): LimitFunction {
    if (!ConcurrencyLimit.instance) {
      ConcurrencyLimit.instance = pLimit(8);
    }

    return ConcurrencyLimit.instance;
  }
}
