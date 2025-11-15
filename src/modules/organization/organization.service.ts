import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { CreateOrganizationRequest } from './dto/create-organization.request';
import { UserDocument } from '../user/user.schema';
import { UpdateOrganizationRequest } from './dto/update-organization.request';
import { GetAllOrganizationsQuery } from './dto/get-all-organizations.query';
import { PageResponse } from '../../dto/page.response';
import { OrganizationResponse } from './dto/organization.response';
import { FileService } from '../file/file.service';
import { Organization, OrganizationDocument } from './organization.schema';
import { FileType } from '../file/file-type.enum';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrganizationRole } from '../organization-member/organization-role.enum';
import { CreateOrganizationMemberPayload } from '../organization-member/dto/create-organization-member.payload';
import { OrganizationMember } from '../organization-member/organization-member.schema';

@Injectable()
export class OrganizationService {
  constructor(
    private organizationRepository: OrganizationRepository,
    private fileService: FileService,
    private eventEmitter: EventEmitter2,
  ) {}

  public async create(
    request: CreateOrganizationRequest,
    user: UserDocument,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    const path = request.name.trim().toLowerCase().replace(/\s/g, '-');
    await this.assertOrganizationNameIsUnique(request.name);
    await this.assertOrganizationPathIsUnique(path);
    let organization: Partial<OrganizationDocument> = new Organization();
    organization.name = request.name;
    organization.email = request.email;
    organization.path = path;
    organization.address = request.address;
    organization.phoneNumber = request.phoneNumber;
    organization.website = request.website;

    if (file) {
      organization.photo = await this.fileService.uploadMulterFile(
        file,
        FileType.OrganizationLogo,
        organization.path,
      );
    }

    organization = await this.organizationRepository.create(organization);
    const payload = new CreateOrganizationMemberPayload(
      organization._id as Types.ObjectId,
      user._id,
      OrganizationRole.Owner,
    );
    this.eventEmitter.emit('organization-member.create', payload);
  }

  public async getAll(
    query: GetAllOrganizationsQuery,
  ): Promise<PageResponse<OrganizationResponse>> {
    const response = await this.organizationRepository.findAll(query);
    const items = await Promise.all(
      response.items.map((organization) =>
        this.responseFromOrganization(organization),
      ),
    );
    return new PageResponse(
      items,
      response.totalItems,
      query.pageNumber,
      query.pageSize,
    );
  }

  public async getAllForUser(
    query: GetAllOrganizationsQuery,
    membership: OrganizationMember[],
  ): Promise<PageResponse<OrganizationResponse>> {
    const response = await this.organizationRepository.findAllByIdsIn(
      query,
      membership.map((item) => item.organization) as Types.ObjectId[],
    );
    const items = await Promise.all(
      response.items.map((organization) =>
        this.responseFromOrganization(organization),
      ),
    );
    return new PageResponse(
      items,
      response.totalItems,
      query.pageNumber,
      query.pageSize,
    );
  }

  public async getByPath(path: string): Promise<OrganizationResponse> {
    const organization = await this.organizationRepository.findByPath(path);

    return await this.responseFromOrganization(
      organization.orElseThrow(() => new NotFoundException()),
    );
  }

  public async findByPath(path: string): Promise<OrganizationDocument> {
    const organization = await this.organizationRepository.findByPath(path);

    return organization.orElseThrow(() => new NotFoundException());
  }

  public async update(
    path: string,
    request: UpdateOrganizationRequest,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    const organization = (
      await this.organizationRepository.findByPath(path)
    ).orElseThrow(() => new NotFoundException());

    const newPath = request.name.trim().toLowerCase().replace(/\s/g, '-');
    if (request.name !== organization.name) {
      await this.assertOrganizationNameIsUnique(request.name);
      await this.assertOrganizationPathIsUnique(newPath);
    }

    organization.name = request.name;
    organization.email = request.email;
    organization.path = newPath;
    organization.address = request.address;
    organization.phoneNumber = request.phoneNumber;
    organization.website = request.website;

    if (file) {
      if (organization.photo) {
        await this.fileService.delete(organization.photo);
      }
      organization.photo = await this.fileService.uploadMulterFile(
        file,
        FileType.OrganizationLogo,
        organization.path,
      );
    }

    await this.organizationRepository.update(organization);
  }

  public async delete(path: string): Promise<void> {
    const organization = (
      await this.organizationRepository.findByPath(path)
    ).orElseThrow(() => new NotFoundException());

    if (organization.photo) {
      await this.fileService.delete(organization.photo);
    }

    await this.organizationRepository.delete(organization._id);
    this.eventEmitter.emit('organization-member.delete', organization._id);
  }

  private async assertOrganizationPathIsUnique(path: string) {
    const organization = await this.organizationRepository.findByPath(path);
    if (organization.isPresent()) {
      throw new BadRequestException('Organization path is not unique');
    }
  }

  private async assertOrganizationNameIsUnique(name: string) {
    const organization = await this.organizationRepository.findByName(name);
    if (organization.isPresent()) {
      throw new BadRequestException('Organization name is not unique');
    }
  }

  private async responseFromOrganization(
    organization: OrganizationDocument,
  ): Promise<OrganizationResponse> {
    const response = new OrganizationResponse();
    response.id = organization._id.toHexString();
    response.name = organization.name;
    response.path = organization.path;
    response.createdAt = organization.createdAt;
    response.address = organization.address;
    response.phoneNumber = organization.phoneNumber;
    response.website = organization.website;
    response.email = organization.email;
    if (organization.photo) {
      response.photo = await this.fileService.getSignedUrl(organization.photo);
    }
    return response;
  }
}
