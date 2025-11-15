import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfig } from './config/mongoose.config';
import { ConfigurationModule } from './config/configuration.module';
import { ProjectModule } from './modules/project/project.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { ChainsModule } from './modules/chains/chains.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DocumentModule } from './modules/document/document.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './config/mailer.config';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { UserModule } from './modules/user/user.module';
import { VerificationCodeModule } from './modules/verification-code/verification-code.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { FileModule } from './modules/file/file.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { OrganizationMemberModule } from './modules/organization-member/organization-member.module';
import { DocumentParserModule } from './modules/document-parser/document-parser.module';
import { RedisModule } from './modules/redis/redis.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ArffModule } from './modules/arff/arff.module';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { DispatchModule } from './modules/dispatch/dispatch.module';

@Module({
  imports: [
    ConfigurationModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (mongooseConfig: MongooseConfig) =>
        mongooseConfig.getMongoConfig(),
      inject: [MongooseConfig],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (config: MailerConfig) => config.getMailerConfig(),
      inject: [MailerConfig],
    }),
    GracefulShutdownModule.forRoot(),
    ChainsModule,
    ProjectModule,
    RequirementModule,
    DocumentModule,
    AuthenticationModule,
    CommunicationsModule,
    UserModule,
    VerificationCodeModule,
    RefreshTokenModule,
    InvitationModule,
    FileModule,
    OrganizationModule,
    OrganizationMemberModule,
    DocumentParserModule,
    RedisModule,
    NotificationModule,
    ArffModule,
    DispatchModule,
  ],
  providers: [],
})
export class AppModule {}
