import { Global, Module } from '@nestjs/common';
import { MongooseConfig } from './mongoose.config';
import { EnvironmentConfig } from './environment.config';
import { ConfigModule } from '@nestjs/config';
import { MailerConfig } from './mailer.config';
import { SecurityConfig } from './security.config';
import { MinIOConfig } from './minio-config.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    EnvironmentConfig,
    MongooseConfig,
    MailerConfig,
    EnvironmentConfig,
    SecurityConfig,
    MinIOConfig,
  ],
  exports: [
    EnvironmentConfig,
    MongooseConfig,
    MailerConfig,
    EnvironmentConfig,
    SecurityConfig,
    MinIOConfig,
  ],
})
export class ConfigurationModule {}
