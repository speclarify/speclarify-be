import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { VerificationCodeModule } from '../verification-code/verification-code.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../config/configuration.module';
import { SecurityConfig } from '../../config/security.config';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt-strategy';
import { UserRolesGuard } from '../../guards/user-roles.guard';
import { OrganizationRolesGuard } from '../../guards/organization-roles.guard';
import { OrganizationMemberModule } from '../organization-member/organization-member.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    VerificationCodeModule,
    OrganizationMemberModule,
    OrganizationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (securityConfig: SecurityConfig) =>
        securityConfig.getJwtConfig(),
      inject: [SecurityConfig],
    }),
    RefreshTokenModule,
    UserModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: UserRolesGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: OrganizationRolesGuard,
    },
  ],
  exports: [],
})
export class AuthenticationModule {}
