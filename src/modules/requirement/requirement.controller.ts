import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirementService } from './requirement.service';
import { CreateRequirementRequest } from './dto/create-requirement.request';
import { GetAllRequirementsQuery } from './dto/get-all-requirements.query';
import { RequirementResponse } from './dto/requirement.response';
import { UpdateRequirementRequest } from './dto/update-requirement.request';
import { ApiParams } from '../../decorator/api-params.decorator';
import { OrganizationRoles } from '../../decorator/organization-roles.decorator';
import { OrganizationRole } from '../organization-member/organization-role.enum';
import { ApiResponse } from '../../dto/api.response';
import { PageResponse } from '../../dto/page.response';

@Controller('organizations/:orgPath/projects/:projectPath/requirements')
@ApiTags('Requirements')
@ApiBearerAuth()
export class RequirementController {
  constructor(private requirementsService: RequirementService) {}

  @Post()
  @ApiParams('orgPath', 'projectPath')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
  )
  public async create(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
    @Body() request: CreateRequirementRequest,
  ): Promise<ApiResponse> {
    await this.requirementsService.create(orgPath, projectPath, request);
    return ApiResponse.success();
  }

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiParams('orgPath', 'projectPath')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async getAll(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
    @Query() query: GetAllRequirementsQuery,
  ): Promise<ApiResponse<PageResponse<RequirementResponse>>> {
    return ApiResponse.success(
      await this.requirementsService.getAll(orgPath, projectPath, query),
    );
  }

  @Get('export')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  @ApiParams('orgPath', 'projectPath')
  public async export(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
  ): Promise<ApiResponse<string>> {
    return ApiResponse.success(
      await this.requirementsService.export(orgPath, projectPath),
    );
  }

  @Get(':requirementId')
  @ApiParams('orgPath', 'projectPath', 'requirementId')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async get(
    @Param('requirementId') requirementId: string,
  ): Promise<ApiResponse<RequirementResponse>> {
    return ApiResponse.success(
      await this.requirementsService.get(requirementId),
    );
  }

  @Put(':requirementId')
  @ApiParams('orgPath', 'projectPath', 'requirementId')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
  )
  public async update(
    @Param('requirementId') requirementId: string,
    @Body() request: UpdateRequirementRequest,
  ): Promise<ApiResponse> {
    await this.requirementsService.update(requirementId, request);
    return ApiResponse.success();
  }

  @Delete(':requirementId')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
  )
  public async delete(
    @Param('requirementId') requirementId: string,
  ): Promise<ApiResponse> {
    await this.requirementsService.delete(requirementId);
    return ApiResponse.success();
  }
}
