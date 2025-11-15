import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { MinIOConfig } from '../../config/minio-config.service';
import { FileType } from './file-type.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly client: Client;
  private readonly bucketName: string;

  constructor(private minIOConfig: MinIOConfig) {
    this.client = new Client(minIOConfig.getMinIOClientOptions());
    this.bucketName = minIOConfig.getBucketName();
  }

  public async uploadMulterFile(
    file: Express.Multer.File,
    type: FileType,
    organizationOrUser: string,
    project?: string,
  ): Promise<string> {
    const uniqueFileName = this.getUniqueFileName(file.originalname);
    const objectName = this.getPath(
      uniqueFileName,
      type,
      organizationOrUser,
      project,
    );
    await this.client.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      undefined,
      {
        'Content-Type': file.mimetype,
      },
    );
    return objectName;
  }

  public async delete(objectName: string) {
    return await this.client.removeObject(this.bucketName, objectName);
  }

  public async getSignedUrl(photo: string) {
    return await this.client.presignedGetObject(
      this.bucketName,
      photo,
      24 * 60 * 60,
    );
  }

  public async uploadBuffer(
    buffer: any,
    fileName: string,
    type: FileType,
    organizationOrUser: string,
    project: string,
    mimeType: string,
  ): Promise<string> {
    const uniqueFileName = this.getUniqueFileName(fileName);
    const objectName = this.getPath(
      uniqueFileName,
      type,
      organizationOrUser,
      project,
    );
    await this.client.putObject(
      this.bucketName,
      objectName,
      buffer,
      undefined,
      {
        'Content-Type': mimeType,
      },
    );
    return objectName;
  }

  private getUniqueFileName(fileName: string) {
    const uuid = uuidv4();
    const fileExtension = fileName.split('.').pop();
    return `${uuid}.${fileExtension}`;
  }

  private getPath(
    uniqueFileName: string,
    type: FileType,
    organizationOrUser: string,
    project: string | undefined,
  ) {
    switch (type) {
      case FileType.ExcelExport:
        return `organizations/${organizationOrUser}/projects/${project}/excel-exports/${uniqueFileName}`;
      case FileType.OrganizationLogo:
        return `organizations/${organizationOrUser}/logo/${uniqueFileName}`;
      case FileType.UserAvatar:
        return `users/${organizationOrUser}/avatar/${uniqueFileName}`;
      case FileType.ProjectDocument:
        return `organizations/${organizationOrUser}/projects/${project}/documents/${uniqueFileName}`;
      case FileType.ProjectLogo:
        return `organizations/${organizationOrUser}/projects/${project}/logo/${uniqueFileName}`;
      default:
        throw new Error('Invalid file type');
    }
  }
}
