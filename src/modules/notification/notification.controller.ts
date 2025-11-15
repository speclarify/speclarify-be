import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../dto/api.response';
import { PageResponse } from '../../dto/page.response';
import { GetAllNotificationsRequest } from './dto/get-all-notifications.request';
import { CurrentUser } from '../../decorator/current-user.decorator';
import { UserDocument } from '../user/user.schema';
import { UpdateNotificationStatusRequest } from './dto/update-notification-status.request';
import { ApiParams } from '../../decorator/api-params.decorator';

interface NotificationResponse {}

@Controller('notifications')
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiQuery({
    name: 'status',
    required: false,
    enum: 'NotificationStatus',
    type: 'enum',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: 'NotificationType',
    type: 'enum',
  })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  public async getAll(
    @Query() query: GetAllNotificationsRequest,
    @CurrentUser() user: UserDocument,
  ): Promise<ApiResponse<PageResponse<NotificationResponse>>> {
    return ApiResponse.success(
      await this.notificationService.getAll(query, user),
    );
  }

  @Put(':id/status')
  @ApiParams('id')
  public async updateStatus(
    @Body() request: UpdateNotificationStatusRequest,
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    await this.notificationService.updateStatus(request, user, id);
    return ApiResponse.success();
  }

  @Patch('read')
  public async markAllAsRead(
    @CurrentUser() user: UserDocument,
  ): Promise<ApiResponse<void>> {
    await this.notificationService.markAllAsRead(user);
    return ApiResponse.success();
  }
}
