import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { Optional } from '../../util/optional';
import { GetAllUsersQuery } from './dto/get-all-users.query';
import { PageResponse } from '../../dto/page.response';
import { UserResponse } from './dto/user.response';
import { FileService } from '../file/file.service';
import { FileType } from '../file/file-type.enum';
import { UpdateUserRequest } from './dto/update-user.request';
import { UpdatePasswordRequest } from './dto/update-password.request';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private fileService: FileService,
  ) {}

  public async create(request: User): Promise<UserDocument> {
    const salt = await bcrypt.genSalt();
    request.password = await bcrypt.hash(request.password, salt);
    return await this.userRepository.save(request);
  }

  public async updateIsVerified(email: string, b: boolean) {
    await this.userRepository.updateIsVerified(email, b);
  }

  public async findByEmailAndIsVerified(email: string, b: boolean) {
    return this.userRepository.findByEmailAndIsVerified(email, b);
  }

  public async findById(
    objectId: Types.ObjectId,
  ): Promise<UserDocument | null> {
    return this.userRepository.findById(objectId);
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  public async deleteByEmail(email: string): Promise<void> {
    await this.userRepository.deleteByEmail(email);
  }

  public async getByEmail(email: string): Promise<Optional<UserDocument>> {
    return Optional.ofNullable(await this.userRepository.findByEmail(email));
  }

  public async getAll(
    query: GetAllUsersQuery,
  ): Promise<PageResponse<UserResponse>> {
    const response = await this.userRepository.getAll(query);

    const items = await Promise.all(
      response.items.map((x) => this.responseFromUser(x)),
    );

    return new PageResponse<UserResponse>(
      items,
      response.totalItems,
      response.currentPage,
      response.pageSize,
    );
  }

  public async responseFromUser(user: UserDocument) {
    const response = new UserResponse();
    response.id = user._id.toHexString();
    response.name = user.name;
    response.email = user.email;
    response.role = user.role;
    response.createdAt = user.createdAt;
    response.isVerified = user.isVerified;
    if (user.photo) {
      response.photo = await this.fileService.getSignedUrl(user.photo);
    }

    return response;
  }

  public async updateMe(
    user: UserDocument,
    updateUserRequest: UpdateUserRequest,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    if (file) {
      if (user.photo) {
        await this.fileService.delete(user.photo);
      }
      user.photo = await this.fileService.uploadMulterFile(
        file,
        FileType.UserAvatar,
        user._id.toHexString(),
      );
    }

    user.name = updateUserRequest.name;
    user.email = updateUserRequest.email;
    await this.userRepository.save(user);
  }

  public async update(persistedUser: UserDocument) {
    return this.userRepository.save(persistedUser);
  }

  public async updatePassword(
    user: UserDocument,
    request: UpdatePasswordRequest,
  ): Promise<void> {
    const isMatch = await bcrypt.compare(
      request.currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new Error('Old password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(request.newPassword, salt);
    await this.userRepository.save(user);
  }
}
