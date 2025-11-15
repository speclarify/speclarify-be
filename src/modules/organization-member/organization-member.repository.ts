import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from './organization-member.schema';
import { Model, Types } from 'mongoose';
import { GetAllOrganizationMembersQuery } from './dto/get-all-members.query';
import { PageResponse } from '../../dto/page.response';
import { Optional } from '../../util/optional';

@Injectable()
export class OrganizationMemberRepository {
  constructor(
    @InjectModel(OrganizationMember.name)
    private model: Model<OrganizationMember>,
  ) {}

  public async create(organizationMember: OrganizationMember): Promise<void> {
    await this.model.create(organizationMember);
  }

  public async findAllByUserId(
    userId: Types.ObjectId,
  ): Promise<OrganizationMemberDocument[]> {
    return await this.model.find({ user: userId }).exec();
  }

  public async deleteAllByOrganizationId(orgId: Types.ObjectId): Promise<void> {
    await this.model.deleteMany({ organization: orgId }).exec();
  }

  public async findAllByOrganizationId(
    orgId: Types.ObjectId,
    request: GetAllOrganizationMembersQuery,
  ): Promise<PageResponse<OrganizationMemberDocument>> {
    const count = await this.model
      .find({
        organization: orgId,
      })
      .populate('user')
      .countDocuments()
      .exec();

    const items = await this.model
      .find({
        organization: orgId,
      })
      .populate('user')
      .skip((request.pageNumber - 1) * request.pageSize)
      .limit(request.pageSize)
      .exec();

    return new PageResponse(items, count, request.pageNumber, request.pageSize);
  }

  public async findByOrganizationIdAndMemberId(
    orgId: Types.ObjectId,
    memberId: Types.ObjectId,
  ): Promise<Optional<OrganizationMemberDocument>> {
    const member = await this.model
      .findOne({
        organization: orgId,
        _id: memberId,
      })
      .exec();

    return Optional.ofNullable(member);
  }

  public async update(
    organizationMember: OrganizationMemberDocument,
  ): Promise<void> {
    await this.model.updateOne(
      { _id: organizationMember._id },
      organizationMember,
    );
  }

  public async delete(_id: Types.ObjectId): Promise<void> {
    await this.model.deleteOne({ _id }).exec();
  }

  public async getMemberByUserAndOrganization(
    userId: Types.ObjectId,
    organizationId: Types.ObjectId,
  ): Promise<OrganizationMemberDocument | null> {
    return await this.model
      .findOne({ user: userId, organization: organizationId })
      .exec();
  }
}
