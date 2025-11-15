import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationMemberRepository } from './organization-member.repository';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from './organization-member.schema';
import { UserDocument } from '../user/user.schema';
import { Types } from 'mongoose';
import { CreateOrganizationMemberRequest } from './dto/create-organization-member.request';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { PageResponse } from '../../dto/page.response';
import { GetAllOrganizationMembersQuery } from './dto/get-all-members.query';
import { OrganizationMemberResponse } from './dto/organization-member.response';
import { UpdateOrganizationMemberRequest } from './dto/update-organization-member.request';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateOrganizationMemberPayload } from './dto/create-organization-member.payload';
import { CreateInvitationPayload } from '../invitation/dto/create-invitation.payload';
import { OrganizationRole } from './organization-role.enum';
import { InvitationDocument } from '../invitation/invitation.schema';

@Injectable()
export class OrganizationMemberService {
  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('organization-member.create')
  public async handleOrganizationMemberCreate(
    payload: CreateOrganizationMemberPayload,
  ) {
    const organizationMember = new OrganizationMember();
    organizationMember.organization = payload.organizationId;
    organizationMember.user = payload.userId;
    organizationMember.role = payload.role;
    await this.organizationMemberRepository.create(organizationMember);
  }

  public async findAllByUserId(
    userId: Types.ObjectId,
  ): Promise<OrganizationMemberDocument[]> {
    return await this.organizationMemberRepository.findAllByUserId(userId);
  }

  @OnEvent('organization-member.delete')
  public async deleteAllByOrganizationId(orgId: Types.ObjectId): Promise<void> {
    await this.organizationMemberRepository.deleteAllByOrganizationId(orgId);
  }

  public async create(
    orgPath: string,
    request: CreateOrganizationMemberRequest,
  ): Promise<void> {
    const organization = await this.organizationService.findByPath(orgPath);
    if (request.role === OrganizationRole.Owner) {
      throw new BadRequestException('Cannot assign owner role to a member');
    }

    const user = await this.userService.getByEmail(request.email);

    if (user.isPresent()) {
      const organizationMember = new OrganizationMember();
      organizationMember.organization = organization._id;
      organizationMember.user = user.get()._id;
      organizationMember.role = request.role;
      await this.organizationMemberRepository.create(organizationMember);
    } else {
      const invitation = new CreateInvitationPayload();
      invitation.email = request.email;
      invitation.organizationId = organization._id;
      invitation.role = request.role;
      invitation.organizationName = organization.name;
      this.eventEmitter.emit('invitation.create', invitation);
    }
  }

  public async getAll(
    orgPath: string,
    request: GetAllOrganizationMembersQuery,
  ): Promise<PageResponse<OrganizationMemberResponse>> {
    const organization = await this.organizationService.findByPath(orgPath);
    const organizationMembers =
      await this.organizationMemberRepository.findAllByOrganizationId(
        organization._id,
        request,
      );

    const items = organizationMembers.items;

    const responses = await Promise.all(
      items.map((x) => this.responseFromDocument(x)),
    );

    return new PageResponse(
      responses,
      organizationMembers.totalItems,
      request.pageNumber,
      request.pageSize,
    );
  }

  public async update(
    orgPath: string,
    memberId: string,
    request: UpdateOrganizationMemberRequest,
  ): Promise<void> {
    const organization = await this.organizationService.findByPath(orgPath);
    const organizationMember = (
      await this.organizationMemberRepository.findByOrganizationIdAndMemberId(
        organization._id,
        Types.ObjectId.createFromHexString(memberId),
      )
    ).orElseThrow(() => new NotFoundException());

    organizationMember.role = request.role;

    await this.organizationMemberRepository.update(organizationMember);
  }

  public async delete(orgPath: string, memberId: string): Promise<void> {
    const organization = await this.organizationService.findByPath(orgPath);
    const organizationMember = (
      await this.organizationMemberRepository.findByOrganizationIdAndMemberId(
        organization._id,
        Types.ObjectId.createFromHexString(memberId),
      )
    ).orElseThrow(() => new NotFoundException());

    await this.organizationMemberRepository.delete(organizationMember._id);
  }

  public async responseFromDocument(
    item: OrganizationMemberDocument,
  ): Promise<OrganizationMemberResponse> {
    const response = new OrganizationMemberResponse();
    response.id = item._id.toHexString();
    response.user = await this.userService.responseFromUser(
      item.user as UserDocument,
    );
    response.role = item.role;
    response.joinedAt = item.createdAt;
    return response;
  }

  public async getMemberByUserAndOrganization(
    userId: Types.ObjectId,
    organizationId: Types.ObjectId,
  ) {
    return await this.organizationMemberRepository.getMemberByUserAndOrganization(
      userId,
      organizationId,
    );
  }

  public async get(
    orgPath: string,
    memberId: string,
  ): Promise<OrganizationMemberResponse> {
    const organization = await this.organizationService.findByPath(orgPath);
    const organizationMember = (
      await this.organizationMemberRepository.findByOrganizationIdAndMemberId(
        organization._id,
        Types.ObjectId.createFromHexString(memberId),
      )
    ).orElseThrow(() => new NotFoundException());

    return this.responseFromDocument(organizationMember);
  }

  public async createForInvitation(
    user: UserDocument,
    invitation: InvitationDocument,
  ): Promise<void> {
    const organizationMember = new OrganizationMember();
    organizationMember.organization = invitation.organization;
    organizationMember.user = user._id;
    organizationMember.role = invitation.role;
    await this.organizationMemberRepository.create(organizationMember);
  }
}
