import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CreateProjectRequest } from './dto/create-project.request';
import { Project, ProjectDocument } from './project.schema';
import { OrganizationService } from '../organization/organization.service';
import { GetAllProjectsQuery } from './dto/get-all-projects.query';
import { PageResponse } from '../../dto/page.response';
import { ProjectResponse } from './dto/project.response';
import { UpdateProjectRequest } from './dto/update-project.request';
import { Types } from 'mongoose';
import { FileType } from '../file/file-type.enum';
import { FileService } from '../file/file.service';

@Injectable()
export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private organizationService: OrganizationService,
    private fileService: FileService,
  ) {}

  public async create(
    request: CreateProjectRequest,
    orgPath: string,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    const organization = await this.organizationService.findByPath(orgPath);
    const path = request.name.trim().toLowerCase().replace(/\s/g, '-');
    await this.assertProjectNameIsUnique(request.name, organization._id);
    await this.assertProjectPathIsUnique(path, organization._id);

    const project = new Project();
    project.name = request.name;
    project.path = path;
    project.organization = organization._id;
    project.description = request.description;

    if (file) {
      project.photo = await this.fileService.uploadMulterFile(
        file,
        FileType.ProjectLogo,
        organization.path,
        project.path,
      );
    }

    await this.projectRepository.create(project);
  }

  public async getAll(
    query: GetAllProjectsQuery,
    orgPath: string,
  ): Promise<PageResponse<ProjectResponse>> {
    const organization = await this.organizationService.findByPath(orgPath);
    const response = await this.projectRepository.findAll(
      query,
      organization._id,
    );
    const items = await Promise.all(
      response.items.map((organization) =>
        this.responseFromProject(organization),
      ),
    );
    return new PageResponse(
      items,
      response.totalItems,
      query.pageNumber,
      query.pageSize,
    );
  }

  public async getByPath(
    orgPath: string,
    projectPath: string,
  ): Promise<ProjectResponse> {
    const organization = await this.organizationService.findByPath(orgPath);
    const project = await this.projectRepository.findByPath(
      projectPath,
      organization._id,
    );

    if (!project.isPresent()) {
      throw new NotFoundException('Project not found');
    }

    return this.responseFromProject(project.get());
  }

  public async findByPath(
    orgPath: string,
    projectPath: string,
  ): Promise<ProjectDocument> {
    const organization = await this.organizationService.findByPath(orgPath);
    const project = await this.projectRepository.findByPath(
      projectPath,
      organization._id,
    );

    return project.orElseThrow(() => new NotFoundException());
  }

  public async update(
    orgPath: string,
    projectPath: string,
    request: UpdateProjectRequest,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    const organization = await this.organizationService.findByPath(orgPath);
    const documentOptional = await this.projectRepository.findByPath(
      projectPath,
      organization._id,
    );

    if (!documentOptional.isPresent()) {
      throw new NotFoundException('Project not found');
    }

    const project = documentOptional.get();
    const newPath = request.name.trim().toLowerCase().replace(/\s/g, '-');
    if (request.name !== project.name) {
      await this.assertProjectNameIsUnique(request.name, organization._id);
      await this.assertProjectPathIsUnique(newPath, organization._id);
    }

    project.name = request.name;
    project.path = newPath;
    project.description = request.description;

    if (file) {
      if (project.photo) {
        await this.fileService.delete(project.photo);
      }
      project.photo = await this.fileService.uploadMulterFile(
        file,
        FileType.ProjectLogo,
        organization.path,
        project.path,
      );
    }

    await this.projectRepository.update(project);
  }

  public async delete(projectPath: string, orgPath: string): Promise<void> {
    const organization = await this.organizationService.findByPath(orgPath);
    const project = await this.projectRepository.findByPath(
      projectPath,
      organization._id,
    );
    if (!project.isPresent()) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.delete(project.get());
  }

  private async assertProjectNameIsUnique(
    name: string,
    organizationId: Types.ObjectId,
  ): Promise<void> {
    const project = await this.projectRepository.findByName(
      name,
      organizationId,
    );
    if (project.isPresent()) {
      throw new BadRequestException('Project name is not unique');
    }
  }

  private async assertProjectPathIsUnique(
    path: string,
    organizationId: Types.ObjectId,
  ): Promise<void> {
    const project = await this.projectRepository.findByPath(
      path,
      organizationId,
    );
    if (project.isPresent()) {
      throw new BadRequestException('Project path is not unique');
    }
  }

  private async responseFromProject(
    project: ProjectDocument,
  ): Promise<ProjectResponse> {
    const response = new ProjectResponse();
    response.id = project._id.toHexString();
    response.name = project.name;
    response.path = project.path;
    response.createdAt = project.createdAt;
    response.description = project.description;
    if (project.photo) {
      response.photo = await this.fileService.getSignedUrl(project.photo);
    }
    return response;
  }
}
