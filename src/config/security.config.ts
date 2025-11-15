import { Injectable } from '@nestjs/common';
import { EnvironmentConfig } from './environment.config';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';

@Injectable()
export class SecurityConfig {
  constructor(private environmentConfig: EnvironmentConfig) {}

  public async getJwtConfig(): Promise<JwtModuleOptions> {
    return {
      secret: this.environmentConfig.getStringFromEnv('JWT_SECRET'),
      signOptions: {
        expiresIn: this.environmentConfig.getStringFromEnv('JWT_EXPIRES_IN'),
      },
    };
  }
}
