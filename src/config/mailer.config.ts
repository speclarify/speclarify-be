import { Injectable } from '@nestjs/common';
import { EnvironmentConfig } from './environment.config';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

@Injectable()
export class MailerConfig {
  constructor(private environmentConfig: EnvironmentConfig) {}

  public getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: this.environmentConfig.getStringFromEnv('MAILER_HOST'),
        port: this.environmentConfig.getNumberFromEnv('MAILER_PORT'),
        secure: this.environmentConfig.getBooleanFromEnv('MAILER_SECURE'),
        requireTLS:
          this.environmentConfig.getBooleanFromEnv('MAILER_REQUIRE_TLS'),
        auth: {
          user: this.environmentConfig.getStringFromEnv('MAILER_USER'),
          pass: this.environmentConfig.getStringFromEnv('MAILER_PASS'),
        },
      },
      defaults: {
        from: this.environmentConfig.getStringFromEnv('MAILER_FROM'),
      },
      template: {
        dir: path.join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
