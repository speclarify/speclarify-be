import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { EnvironmentConfig } from '../../config/environment.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private environmentConfig: EnvironmentConfig) {}

  public async onModuleInit(): Promise<any> {
    const host = this.environmentConfig.getStringFromEnv('REDIS_HOST');
    const password =
      this.environmentConfig.getOptionalStringFromEnv('REDIS_PASSWORD');
    const port = this.environmentConfig.getStringFromEnv('REDIS_PORT');
    const db = this.environmentConfig.getStringFromEnv('REDIS_DB');
    const authSegment = password ? `:${password}@` : '';
    const redisUrl = `redis://${authSegment}${host}:${port}/${db}`;

    this.client = (await createClient({
      url: redisUrl,
    })
      .on('error', (error) => {
        this.logger.error(error);
        throw error;
      })
      .connect()) as RedisClientType;
  }

  public async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  public async set(key: string, value: string): Promise<void> {
    this.logger.debug(`Setting key: ${key} with value: ${value}`);
    try {
      await this.client.set(key, value);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async get(key: string): Promise<string | null> {
    this.logger.debug(`Getting key: ${key}`);
    try {
      return this.client.get(key);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  public async delete(key: string): Promise<void> {
    this.logger.debug(`Deleting key: ${key}`);
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
