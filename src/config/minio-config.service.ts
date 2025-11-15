import { Injectable } from '@nestjs/common';
import { EnvironmentConfig } from './environment.config';
import { ClientOptions } from 'minio';

@Injectable()
export class MinIOConfig {
  constructor(private environmentConfig: EnvironmentConfig) {}

  public getMinIOClientOptions(): ClientOptions {
    return {
      endPoint: this.environmentConfig.getStringFromEnv('MINIO_ENDPOINT'),
      port: this.environmentConfig.getNumberFromEnv('MINIO_PORT'),
      useSSL: this.environmentConfig.getBooleanFromEnv('MINIO_USE_SSL'),
      accessKey: this.environmentConfig.getStringFromEnv('MINIO_ACCESS_KEY'),
      secretKey: this.environmentConfig.getStringFromEnv('MINIO_SECRET_KEY'),
    };
  }

  public getBucketName(): string {
    return this.environmentConfig.getStringFromEnv('MINIO_BUCKET_NAME');
  }
}
