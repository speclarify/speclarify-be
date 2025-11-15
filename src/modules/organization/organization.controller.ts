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
import { CreateOrganizationRequest } from './dto/create-organization.request';
import { CurrentUser } from '../../decorator/current-user.decorator';
import { UserDocument } from '../user/user.schema';
import { GetAllOrganizationsQuery } from './dto/get-all-organizations.query';
import { OrganizationResponse } from './dto/organization.response';
import { ApiResponse } from '../../dto/api.response';
import { PageResponse } from '../../dto/page.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateOrganizationRequest } from './dto/update-organization.request';
import { ValidatedFile } from '../../decorator/validated-file.decorator';
import { OrganizationService } from './organization.service';
import { ApiParams } from '../../decorator/api-params.decorator';
import { UserRole } from '../user/user-role.enum';
import { OrganizationRoles } from '../../decorator/organization-roles.decorator';
import { OrganizationRole } from '../organization-member/organization-role.enum';
import { Membership } from '../../decorator/membership.decorator';
import { OrganizationMember } from '../organization-member/organization-member.schema';

@Controller('organizations')
@ApiTags('Organizations')
@ApiBearerAuth()
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  public async create(
    @Body() request: CreateOrganizationRequest,
    @CurrentUser() user: UserDocument,
    @ValidatedFile(false, 5, 'image/png', 'image/jpeg', 'image/jpg')
    file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    await this.organizationService.create(request, user, file);
    return ApiResponse.success();
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  public async getAll(
    @Query() query: GetAllOrganizationsQuery,
    @CurrentUser() user: UserDocument,
    @Membership() membership: OrganizationMember[],
  ): Promise<ApiResponse<PageResponse<OrganizationResponse>>> {
    if (user.role === UserRole.Admin) {
      return ApiResponse.success(await this.organizationService.getAll(query));
    }
    return ApiResponse.success(
      await this.organizationService.getAllForUser(query, membership),
    );
  }

  @Get(':orgPath')
  @ApiOperation({ summary: 'Get organization by path' })
  @ApiParams('orgPath')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async getByPath(
    @Param('orgPath') orgPath: string,
  ): Promise<ApiResponse<OrganizationResponse>> {
    return ApiResponse.success(
      await this.organizationService.getByPath(orgPath),
    );
  }

  @Put(':orgPath')
  @ApiOperation({ summary: 'Update organization by path' })
  @ApiParams('orgPath')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  public async update(
    @Param('orgPath') orgPath: string,
    @Body() request: UpdateOrganizationRequest,
    @ValidatedFile(false, 5, 'image/png', 'image/jpeg', 'image/jpg')
    file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    await this.organizationService.update(orgPath, request, file);
    return ApiResponse.success();
  }

  @Delete(':orgPath')
  @ApiParams('orgPath')
  @ApiOperation({ summary: 'Delete organization by path' })
  @OrganizationRoles(OrganizationRole.Owner, OrganizationRole.Admin)
  public async delete(@Param('orgPath') orgPath: string): Promise<ApiResponse> {
    await this.organizationService.delete(orgPath);
    return ApiResponse.success();
  }
}
