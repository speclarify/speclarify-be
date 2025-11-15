import { Injectable } from '@nestjs/common';
import { EnvironmentConfig } from './environment.config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

@Injectable()
export class MongooseConfig {
  constructor(private readonly environmentConfig: EnvironmentConfig) {}

  public async getMongoConfig(): Promise<MongooseModuleFactoryOptions> {
    return {
      uri: this.environmentConfig.getStringFromEnv('MONGO_URI'),
      user: this.environmentConfig.getStringFromEnv('MONGO_USER'),
      pass: this.environmentConfig.getStringFromEnv('MONGO_PASSWORD'),
      dbName: this.environmentConfig.getStringFromEnv('MONGO_DB_NAME'),
      authSource: this.environmentConfig.getStringFromEnv('MONGO_AUTH_SOURCE'),
    };
  }
}
