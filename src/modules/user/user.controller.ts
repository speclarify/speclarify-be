import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { GetAllUsersQuery } from './dto/get-all-users.query';
import { UserResponse } from './dto/user.response';
import { PageResponse } from '../../dto/page.response';
import { ApiResponse } from '../../dto/api.response';
import { CurrentUser } from '../../decorator/current-user.decorator';
import { UserDocument } from './user.schema';
import { UserRoles } from '../../decorator/user-roles.decorator';
import { UserRole } from './user-role.enum';
import { UpdateUserRequest } from './dto/update-user.request';
import { ValidatedFile } from '../../decorator/validated-file.decorator';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePasswordRequest } from './dto/update-password.request';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @UserRoles(UserRole.Admin)
  public async getAll(
    @Query() query: GetAllUsersQuery,
  ): Promise<ApiResponse<PageResponse<UserResponse>>> {
    return ApiResponse.success(await this.userService.getAll(query));
  }

  @Get('me')
  public async getMe(
    @CurrentUser() user: UserDocument,
  ): Promise<ApiResponse<UserResponse>> {
    return ApiResponse.success(await this.userService.responseFromUser(user));
  }

  @Put('me')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  public async updateMe(
    @CurrentUser() user: UserDocument,
    @Body() updateUserRequest: UpdateUserRequest,
    @ValidatedFile(false, 5, 'image/jpeg', 'image/png')
    photo?: Express.Multer.File,
  ): Promise<ApiResponse<void>> {
    await this.userService.updateMe(user, updateUserRequest, photo);
    return ApiResponse.success();
  }

  @Put('me/password')
  public async updatePassword(
    @CurrentUser() user: UserDocument,
    @Body() request: UpdatePasswordRequest,
  ): Promise<ApiResponse<void>> {
    await this.userService.updatePassword(user, request);
    return ApiResponse.success();
  }
}
