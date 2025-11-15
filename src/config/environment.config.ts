import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfig {
  constructor(private configService: ConfigService) {}

  public getStringFromEnv(key: string): string {
    return this.getFromEnv(key).replace(/\\n/g, '\n');
  }

  public getNumberFromEnv(key: string): number {
    const value = this.getFromEnv(key);

    try {
      return Number(value);
    } catch {
      throw new Error(`Environment variable "${key}" is not a number!`);
    }
  }

  public getBooleanFromEnv(key: string): boolean {
    const value = this.getFromEnv(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(`Environment variable "${key}" is not a boolean!`);
    }
  }

  public isProduction(): boolean {
    return this.getNodeENV() === 'production';
  }

  public isDevelopment(): boolean {
    return this.getNodeENV() === 'development';
  }

  public isTest(): boolean {
    return this.getNodeENV() === 'test';
  }

  public getNodeENV(): string {
    return this.getStringFromEnv('NODE_ENV');
  }

  public getOptionalStringFromEnv(key: string): string | undefined {
    const value = this.configService.get<string>(key);

    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return value.replace(/\\n/g, '\n');
  }

  private getFromEnv(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) throw new Error(`Environment variable "${key}" is not set!`);

    return value;
  }
}
