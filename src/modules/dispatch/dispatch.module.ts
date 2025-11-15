import { Global, Module } from '@nestjs/common';
import { DispatchGateway } from './dispatch.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../config/configuration.module';
import { SecurityConfig } from '../../config/security.config';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (securityConfig: SecurityConfig) =>
        securityConfig.getJwtConfig(),
      inject: [SecurityConfig],
    }),
    UserModule,
  ],
  controllers: [],
  providers: [DispatchGateway],
  exports: [],
})
export class DispatchModule {}
