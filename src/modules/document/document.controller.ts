import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatedFile } from '../../decorator/validated-file.decorator';
import { Express } from 'express';
import { DocumentService } from './document.service';
import { ApiParams } from '../../decorator/api-params.decorator';
import { ParsePdfRequest } from '../document-parser/payload/parse-pdf.request';
import { OrganizationRoles } from '../../decorator/organization-roles.decorator';
import { OrganizationRole } from '../organization-member/organization-role.enum';
import { ApiResponse } from '../../dto/api.response';

@Controller('organizations/:orgPath/projects/:projectPath/documents')
@ApiTags('Documents')
@ApiBearerAuth()
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  @ApiParams('orgPath', 'projectPath')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    type: ParsePdfRequest,
  })
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
  )
  public async create(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
    @ValidatedFile(
      true,
      100,
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    )
    file: Express.Multer.File,
  ): Promise<ApiResponse> {
    await this.documentService.create(orgPath, projectPath, file);
    return ApiResponse.success();
  }

  @Get()
  @ApiParams('orgPath', 'projectPath')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
    OrganizationRole.Viewer,
  )
  public async findAll(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
  ) {
    return ApiResponse.success(
      await this.documentService.findAll(orgPath, projectPath),
    );
  }

  @Delete(':documentId')
  @ApiParams('orgPath', 'projectPath', 'documentId')
  @OrganizationRoles(
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Editor,
  )
  public async delete(
    @Param('orgPath') orgPath: string,
    @Param('projectPath') projectPath: string,
    @Param('documentId') documentId: string,
  ) {
    await this.documentService.delete(documentId);
    return ApiResponse.success();
  }
}
