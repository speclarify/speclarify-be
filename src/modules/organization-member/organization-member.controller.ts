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
import { OrganizationMemberService } from './organization-member.service';
import { ApiParams } from '../../decorator/api-params.decorator';
import { ApiResponse } from '../../dto/api.response';
import { PageResponse } from '../../dto/page.response';
import { CreateOrganizationMemberRequest } from './dto/create-organization-member.request';
import { GetAllOrganizationMembersQuery } from './dto/get-all-members.query';
import { OrganizationMemberResponse } from './dto/organization-member.response';
import { UpdateOrganizationMemberRequest } from './dto/update-organization-member.request';
import { OrganizationRoles } from '../../decorator/organization-roles.decorator';
import { OrganizationRole } from './organization-role.enum';

@Controller('organizations/:orgPath/members')
@ApiTags('Organization Members')
@ApiBearerAuth()
export class OrganizationMemberController {
  constructor(private organizationMemberService: OrganizationMemberService) {}

  @Post()
  @ApiParams('orgPath')
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  public async create(
    @Param('orgPath') orgPath: string,
    @Body() request: CreateOrganizationMemberRequest,
  ): Promise<ApiResponse> {
    await this.organizationMemberService.create(orgPath, request);
    return ApiResponse.success();
  }

  @Get()
  @ApiParams('orgPath')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async getAll(
    @Param('orgPath') orgPath: string,
    @Query() request: GetAllOrganizationMembersQuery,
  ): Promise<ApiResponse<PageResponse<OrganizationMemberResponse>>> {
    return ApiResponse.success(
      await this.organizationMemberService.getAll(orgPath, request),
    );
  }

  @Get(':memberId')
  @ApiParams('orgPath', 'memberId')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async get(
    @Param('orgPath') orgPath: string,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse<OrganizationMemberResponse>> {
    return ApiResponse.success(
      await this.organizationMemberService.get(orgPath, memberId),
    );
  }

  @Put(':memberId')
  @ApiParams('orgPath', 'memberId')
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  public async update(
    @Param('orgPath') orgPath: string,
    @Param('memberId') memberId: string,
    @Body() request: UpdateOrganizationMemberRequest,
  ): Promise<ApiResponse> {
    await this.organizationMemberService.update(orgPath, memberId, request);
    return ApiResponse.success();
  }

  @Delete(':memberId')
  @ApiParams('orgPath', 'memberId')
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  public async delete(
    @Param('orgPath') orgPath: string,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse> {
    await this.organizationMemberService.delete(orgPath, memberId);
    return ApiResponse.success();
  }
}
