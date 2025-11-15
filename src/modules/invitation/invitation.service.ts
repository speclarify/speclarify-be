import { Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import { Invitation } from './invitation.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateInvitationPayload } from './dto/create-invitation.payload';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { EnvironmentConfig } from '../../config/environment.config';
import { UserDocument } from '../user/user.schema';
import { OrganizationMemberService } from '../organization-member/organization-member.service';

@Injectable()
export class InvitationService {
  constructor(
    private invitationRepository: InvitationRepository,
    private eventEmitter: EventEmitter2,
    private environmentConfig: EnvironmentConfig,
    private organizationMemberService: OrganizationMemberService,
  ) {}

  @OnEvent('invitation.create')
  public async create(payload: CreateInvitationPayload) {
    const invitation = new Invitation();
    invitation.organization = payload.organizationId;
    invitation.email = payload.email;
    invitation.role = payload.role;
    await this.invitationRepository.create(invitation);

    const sendMailOptions: ISendMailOptions = {
      to: payload.email,
      subject: 'Invitation to join organization',
      template: 'invitation-email-template',
      context: {
        organizationName: payload.organizationName,
        confirmationUrl: this.environmentConfig.getStringFromEnv('SIGNUP_URL'),
      },
    };

    this.eventEmitter.emit('email.send', sendMailOptions);
  }

  @OnEvent('user.verified')
  public async userVerified(user: UserDocument) {
    const invitations = await this.invitationRepository.findByEmail(user.email);
    for (const invitation of invitations) {
      await this.organizationMemberService.createForInvitation(
        user,
        invitation,
      );
      await this.invitationRepository.deleteById(invitation._id);
    }
  }
}
