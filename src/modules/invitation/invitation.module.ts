import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation, InvitationSchema } from './invitation.schema';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { InvitationRepository } from './invitation.repository';
import { OrganizationMemberModule } from '../organization-member/organization-member.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Invitation.name,
        schema: InvitationSchema,
      },
    ]),
    OrganizationMemberModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationRepository],
  exports: [InvitationService],
})
export class InvitationModule {}
