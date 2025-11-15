export class Optional<T> {
  private value: T | null;

  private constructor(value: T | null) {
    this.value = value;
  }

  public static of<T>(value: T): Optional<T> {
    if (value === null || value === undefined) {
      throw new Error(
        'Value passed to Optional.of() cannot be null or undefined',
      );
    }
    return new Optional<T>(value);
  }

  public static empty<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  public static ofNullable<T>(value: T | null): Optional<T> {
    return new Optional<T>(value);
  }

  public isPresent(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  public ifPresent(consumer: (value: T) => void): void {
    if (this.isPresent()) {
      consumer(this.value as T);
    }
  }

  public get(): T {
    if (!this.isPresent()) {
      throw new Error('Value not present');
    }
    return this.value as T;
  }

  public orElse(other: T): T {
    return this.isPresent() ? (this.value as T) : other;
  }

  public orElseGet(supplier: () => T): T {
    return this.isPresent() ? (this.value as T) : supplier();
  }

  public orElseThrow(errorSupplier: () => Error): T {
    if (this.isPresent()) {
      return this.value as T;
    } else {
      throw errorSupplier();
    }
  }
}
