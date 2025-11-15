import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectRequest } from './dto/create-project.request';
import { ProjectResponse } from './dto/project.response';
import { UpdateProjectRequest } from './dto/update-project.request';
import { GetAllProjectsQuery } from './dto/get-all-projects.query';
import { ApiResponse } from '../../dto/api.response';
import { PageResponse } from '../../dto/page.response';
import { ApiParams } from '../../decorator/api-params.decorator';
import { OrganizationRoles } from '../../decorator/organization-roles.decorator';
import { OrganizationRole } from '../organization-member/organization-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatedFile } from '../../decorator/validated-file.decorator';

@Controller('organizations/:orgPath/projects')
@ApiTags('Projects')
@ApiBearerAuth()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @ApiParams('orgPath')
  @ApiOperation({ summary: 'Create a new project' })
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  public async create(
    @Body() request: CreateProjectRequest,
    @Param('orgPath') orgPath: string,
    @ValidatedFile(false, 5, 'image/png', 'image/jpeg', 'image/jpg')
    file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    await this.projectService.create(request, orgPath, file);
    return ApiResponse.success();
  }

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiParams('orgPath')
  @ApiOperation({ summary: 'Get all projects' })
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async getAll(
    @Query() query: GetAllProjectsQuery,
    @Param('orgPath') orgPath: string,
  ): Promise<ApiResponse<PageResponse<ProjectResponse>>> {
    return ApiResponse.success(
      await this.projectService.getAll(query, orgPath),
    );
  }

  @Get(':projectPath')
  @ApiParams('orgPath', 'projectPath')
  @ApiOperation({ summary: 'Get a project' })
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async getByPath(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
  ): Promise<ApiResponse<ProjectResponse>> {
    return ApiResponse.success(
      await this.projectService.getByPath(orgPath, projectPath),
    );
  }

  @Put(':projectPath')
  @ApiParams('orgPath', 'projectPath')
  @ApiOperation({ summary: 'Update a project' })
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  public async update(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
    @Body() request: UpdateProjectRequest,
    @ValidatedFile(false, 5, 'image/png', 'image/jpeg', 'image/jpg')
    file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    await this.projectService.update(orgPath, projectPath, request, file);
    return ApiResponse.success();
  }

  @Delete(':projectPath')
  @ApiParams('orgPath', 'projectPath')
  @ApiOperation({ summary: 'Delete a project' })
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  public async delete(
    @Param('projectPath') projectPath: string,
    @Param('orgPath') orgPath: string,
  ): Promise<ApiResponse> {
    await this.projectService.delete(projectPath, orgPath);
    return ApiResponse.success();
  }
}
