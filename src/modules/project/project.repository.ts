import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import { GetAllProjectsQuery } from './dto/get-all-projects.query';
import { PageResponse } from '../../dto/page.response';
import { Optional } from '../../util/optional';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  public async create(project: Project): Promise<void> {
    await this.projectModel.create(project);
  }

  public async findByName(
    name: string,
    organizationId: Types.ObjectId,
  ): Promise<Optional<ProjectDocument>> {
    return Optional.ofNullable(
      await this.projectModel
        .findOne({
          name,
          organization: organizationId,
        })
        .exec(),
    );
  }

  public async findByPath(
    path: string,
    organizationId: Types.ObjectId,
  ): Promise<Optional<ProjectDocument>> {
    return Optional.ofNullable(
      await this.projectModel
        .findOne({ path, organization: organizationId })
        .exec(),
    );
  }

  public async findAll(
    query: GetAllProjectsQuery,
    organizationId: Types.ObjectId,
  ): Promise<PageResponse<ProjectDocument>> {
    const filter: FilterQuery<Project> = {
      name: {
        $regex: query.search,
        $options: 'i',
      },
      organization: organizationId,
    };

    const count = await this.projectModel
      .find(filter)
      .populate('organization')
      .countDocuments()
      .exec();

    const items = await this.projectModel
      .find(filter)
      .populate('organization')
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .sort({ createdAt: -1 })
      .exec();

    return new PageResponse(items, count, query.pageNumber, query.pageSize);
  }

  public async update(project: ProjectDocument): Promise<void> {
    await this.projectModel.updateOne({ _id: project._id }, project).exec();
  }

  public async delete(param: ProjectDocument) {
    await this.projectModel.deleteOne({ _id: param._id }).exec();
  }
}
