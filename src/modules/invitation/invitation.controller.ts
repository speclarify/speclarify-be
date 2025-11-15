import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InvitationService } from './invitation.service';

@Controller('invitations')
@ApiTags('Invitations')
@ApiBearerAuth()
export class InvitationController {
  constructor(private invitationService: InvitationService) {}
}
