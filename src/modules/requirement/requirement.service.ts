import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequirementRepository } from './requirement.repository';
import { ProjectService } from '../project/project.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Requirement, RequirementDocument } from './requirement.schema';
import { Types } from 'mongoose';
import { BulkCreateRequirementRequest } from './dto/bulk-create-requirement.request';
import { ConcurrencyLimit } from '../../util/concurrency-limit';
import { RequirementPriorityChain } from '../chains/requirement-priority.chain';
import { RequirementClassifyChain } from '../chains/requirement-classify.chain';
import { CreateRequirementRequest } from './dto/create-requirement.request';
import { GetAllRequirementsQuery } from './dto/get-all-requirements.query';
import { RequirementResponse } from './dto/requirement.response';
import { UpdateRequirementRequest } from './dto/update-requirement.request';
import { PageResponse } from '../../dto/page.response';
import * as XLSX from 'xlsx';
import { FileService } from '../file/file.service';
import { FileType } from '../file/file-type.enum';

@Injectable()
export class RequirementService {
  constructor(
    private requirementRepository: RequirementRepository,
    private projectService: ProjectService,
    private requirementPriorityChain: RequirementPriorityChain,
    private requirementClassifyChain: RequirementClassifyChain,
    private eventEmitter: EventEmitter2,
    private fileService: FileService,
  ) {}

  public async create(
    orgPath: string,
    projectPath: string,
    request: CreateRequirementRequest,
  ): Promise<void> {
    const project = await this.projectService.findByPath(orgPath, projectPath);

    try {
      const limit = ConcurrencyLimit.getInstance();

      await limit(() => this.createRequirement(request, project._id));
    } catch (e) {
      throw new BadRequestException('Not a valid requirement');
    }
  }

  @OnEvent('BulkCreateRequirementRequest')
  public async onBulkCreateRequirementRequest(
    payload: BulkCreateRequirementRequest,
  ): Promise<void> {
    const limit = ConcurrencyLimit.getInstance();
    const { projectId, requirements } = payload;

    await Promise.all(
      requirements.map((requirement) =>
        limit(() => this.createRequirement(requirement, projectId)),
      ),
    );
  }

  public async getAll(
    orgPath: string,
    projectPath: string,
    query: GetAllRequirementsQuery,
  ): Promise<PageResponse<RequirementResponse>> {
    const project = await this.projectService.findByPath(orgPath, projectPath);

    const requirements = await this.requirementRepository.findAll(
      project._id,
      query,
    );

    return new PageResponse(
      requirements.items.map(RequirementResponse.fromRequirement),
      requirements.totalItems,
      query.pageNumber,
      query.pageSize,
    );
  }

  public async update(
    requirementId: string,
    request: UpdateRequirementRequest,
  ): Promise<void> {
    const objectId = Types.ObjectId.createFromHexString(requirementId);
    const requirement = await this.requirementRepository.findById(objectId);

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    requirement.identifier = request.identifier;
    requirement.description = request.description;
    requirement.priority = request.priority;
    requirement.type = request.type;

    await this.requirementRepository.save(requirement);
  }

  public async delete(requirementId: string): Promise<void> {
    const objectId = Types.ObjectId.createFromHexString(requirementId);

    await this.requirementRepository.delete(objectId);
  }

  public async findById(
    id: Types.ObjectId,
  ): Promise<RequirementDocument | null> {
    return this.requirementRepository.findById(id);
  }

  public async get(requirementId: string): Promise<RequirementResponse> {
    const requirement = await this.requirementRepository.findById(
      Types.ObjectId.createFromHexString(requirementId),
    );

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    return RequirementResponse.fromRequirement(requirement);
  }

  public async export(orgPath: string, projectPath: string): Promise<string> {
    const project = await this.projectService.findByPath(orgPath, projectPath);
    const requirements = await this.requirementRepository.findAllByProjectId(
      project._id,
    );

    const data = requirements.map((requirement) => {
      return {
        Identifier: requirement.identifier,
        Description: requirement.description,
        Type: requirement.type,
        Priority: requirement.priority,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requirements');
    const buffer = XLSX.write(workbook, { type: 'buffer' });

    const path = await this.fileService.uploadBuffer(
      buffer,
      `requirements-${new Date().toISOString()}.xlsx`,
      FileType.ExcelExport,
      orgPath,
      projectPath,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return await this.fileService.getSignedUrl(path);
  }

  private async createRequirement(
    request: CreateRequirementRequest,
    projectId: Types.ObjectId,
  ): Promise<void> {
    const priority = await this.requirementPriorityChain.execute(
      request.description,
    );

    const requirement = new Requirement();

    if (request.type) {
      requirement.type = request.type;
    } else {
      const requirements =
        await this.requirementRepository.findAllWithoutFilters();

      const examples: {
        input: string;
        output: string;
      }[] = requirements
        .filter((item) => item.description !== request.description)
        .map((item) => ({
          input: item.description,
          output: item.type,
        }));

      requirement.type = await this.requirementClassifyChain.execute(
        request.description,
        examples,
      );
    }

    requirement.identifier = request.identifier;
    requirement.description = request.description;
    requirement.priority = priority;
    requirement.project = projectId;
    const { _id } = await this.requirementRepository.create(requirement);

    this.eventEmitter.emit('IdentifyAmbiguityRequest', _id);
  }
}
