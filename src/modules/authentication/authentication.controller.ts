import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { SignUpRequest } from './dto/sign-up.request';
import { SignInRequest } from './dto/sign-in.request';
import { RefreshTokenRequest } from './dto/refresh-token.request';
import { Public } from '../../decorator/public.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import { SignInResponse } from './dto/sign-in.response';
import { CurrentUser } from '../../decorator/current-user.decorator';
import { UserDocument } from '../user/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatedFile } from '../../decorator/validated-file.decorator';
import { Express } from 'express';
import { VerifyEmailRequest } from './dto/verify-email.request';
import { ApiResponse } from '../../dto/api.response';
import { RefreshAccessTokenResponse } from './dto/refresh-access-token.response';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('sign-up')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  public async signUp(
    @Body() request: SignUpRequest,
    @ValidatedFile(false, 5, 'image/jpeg', 'image/png')
    photo?: Express.Multer.File,
  ): Promise<ApiResponse> {
    await this.authenticationService.signUp(request, photo);
    return ApiResponse.success();
  }

  @Public()
  @Post('verify-email')
  public async verifyEmail(
    @Body() request: VerifyEmailRequest,
  ): Promise<ApiResponse<SignInResponse>> {
    return ApiResponse.success(
      await this.authenticationService.verifyEmail(request),
    );
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  public async signIn(
    @Body() request: SignInRequest,
  ): Promise<ApiResponse<SignInResponse>> {
    return ApiResponse.success(
      await this.authenticationService.signIn(request),
    );
  }

  @Public()
  @Post('refresh-token')
  public async refreshToken(
    @Body() request: RefreshTokenRequest,
  ): Promise<ApiResponse<RefreshAccessTokenResponse>> {
    return ApiResponse.success(
      await this.authenticationService.refreshAccessToken(request),
    );
  }

  @Post('invalidate-token')
  @ApiBearerAuth()
  public async invalidateToken(
    @CurrentUser() user: UserDocument,
  ): Promise<ApiResponse> {
    await this.authenticationService.invalidateToken(user);
    return ApiResponse.success();
  }
}
