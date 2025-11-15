import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Requirement, RequirementDocument } from './requirement.schema';
import { GetAllRequirementsQuery } from './dto/get-all-requirements.query';
import { PageResponse } from '../../dto/page.response';

@Injectable()
export class RequirementRepository {
  constructor(
    @InjectModel(Requirement.name)
    private requirementModel: Model<Requirement>,
  ) {}

  public async findAll(
    projectId: Types.ObjectId,
    query: GetAllRequirementsQuery,
  ): Promise<PageResponse<RequirementDocument>> {
    const regex = new RegExp(query.search, 'i');
    const filter: FilterQuery<Requirement> = {
      project: projectId,
      $or: [
        {
          identifier: regex,
        },
        {
          description: regex,
        },
      ],
    };

    const count = await this.requirementModel.countDocuments(filter);

    const items = await this.requirementModel
      .find(filter, null, {
        skip: (query.pageNumber - 1) * query.pageSize,
        limit: query.pageSize,
        sort: {
          createdAt: 'desc',
        },
      })
      .exec();

    return new PageResponse(items, count, query.pageNumber, query.pageSize);
  }

  public async create(
    items: Partial<Requirement>,
  ): Promise<RequirementDocument>;
  public async create(
    items: Partial<Requirement>[],
  ): Promise<RequirementDocument[]>;
  public async create(
    items: Partial<Requirement> | Partial<Requirement>[],
  ): Promise<RequirementDocument | RequirementDocument[]> {
    return this.requirementModel.create(items);
  }

  public async findById(
    id: Types.ObjectId,
  ): Promise<RequirementDocument | null> {
    return this.requirementModel.findById(id);
  }

  public async update(
    _id: Types.ObjectId,
    requirement: Partial<Requirement>,
  ): Promise<void> {
    this.requirementModel.updateOne(
      {
        _id,
      },
      requirement,
    );
  }

  public async delete(objectId: Types.ObjectId): Promise<void> {
    await this.requirementModel.deleteOne({
      _id: objectId,
    });
  }

  public async findAllByProjectId(_id: Types.ObjectId) {
    return this.requirementModel.find({ project: _id }).exec();
  }

  public async save(requirement: RequirementDocument) {
    await this.requirementModel.updateOne(
      {
        _id: requirement._id,
      },
      requirement,
    );
  }

  public async findAllWithoutFilters(): Promise<RequirementDocument[]> {
    return this.requirementModel.find().exec();
  }
}
