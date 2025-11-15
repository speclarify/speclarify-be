import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organization, OrganizationDocument } from './organization.schema';
import { Model, Types } from 'mongoose';
import { GetAllOrganizationsQuery } from './dto/get-all-organizations.query';
import { PageResponse } from '../../dto/page.response';
import { Optional } from '../../util/optional';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectModel(Organization.name) private model: Model<Organization>,
  ) {}

  public async create(
    organization: Partial<OrganizationDocument>,
  ): Promise<OrganizationDocument> {
    return await this.model.create(organization);
  }

  public async findAll(
    request: GetAllOrganizationsQuery,
  ): Promise<PageResponse<OrganizationDocument>> {
    const count = await this.model
      .find({
        name: {
          $regex: request.search,
          $options: 'i',
        },
      })
      .countDocuments()
      .exec();

    const items = await this.model
      .find({
        name: {
          $regex: request.search,
          $options: 'i',
        },
      })
      .skip((request.pageNumber - 1) * request.pageSize)
      .limit(request.pageSize)
      .sort({ createdAt: -1 })
      .exec();

    return new PageResponse(items, count, request.pageNumber, request.pageSize);
  }

  public async findByPath(
    path: string,
  ): Promise<Optional<OrganizationDocument>> {
    return Optional.ofNullable(await this.model.findOne({ path }).exec());
  }

  public async update(organization: OrganizationDocument): Promise<void> {
    await this.model.updateOne(
      { _id: organization._id },
      {
        name: organization.name,
        email: organization.email,
        path: organization.path,
        photo: organization.photo,
      },
    );
  }

  public async delete(_id: Types.ObjectId) {
    await this.model.deleteOne({ _id }).exec();
  }

  public async findByName(
    name: string,
  ): Promise<Optional<OrganizationDocument>> {
    return Optional.ofNullable(await this.model.findOne({ name }).exec());
  }

  public async findAllByIdsIn(
    request: GetAllOrganizationsQuery,
    objectIds: Types.ObjectId[],
  ): Promise<PageResponse<OrganizationDocument>> {
    const count = await this.model
      .find({
        _id: {
          $in: objectIds,
        },
        name: {
          $regex: request.search,
          $options: 'i',
        },
      })
      .countDocuments()
      .exec();

    const items = await this.model
      .find({
        _id: {
          $in: objectIds,
        },
        name: {
          $regex: request.search,
          $options: 'i',
        },
      })
      .skip((request.pageNumber - 1) * request.pageSize)
      .limit(request.pageSize)
      .sort({ createdAt: -1 })
      .exec();

    return new PageResponse(items, count, request.pageNumber, request.pageSize);
  }
}
