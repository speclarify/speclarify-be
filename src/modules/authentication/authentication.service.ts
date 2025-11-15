import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { EnvironmentConfig } from '../../config/environment.config';
import { SignUpRequest } from './dto/sign-up.request';
import { UserService } from '../user/user.service';
import { VerificationCodeService } from '../verification-code/verification-code.service';
import { SignInRequest } from './dto/sign-in.request';
import { SignInResponse } from './dto/sign-in.response';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from '../user/dto/user.response';
import { RefreshAccessTokenResponse } from './dto/refresh-access-token.response';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenRequest } from './dto/refresh-token.request';
import { User, UserDocument } from '../user/user.schema';
import { Types } from 'mongoose';
import { UserRole } from '../user/user-role.enum';
import { FileService } from '../file/file.service';
import { FileType } from '../file/file-type.enum';
import { VerifyEmailRequest } from './dto/verify-email.request';

@Injectable()
export class AuthenticationService {
  constructor(
    private eventEmitter: EventEmitter2,
    private environmentConfig: EnvironmentConfig,
    private userService: UserService,
    private verificationCodeService: VerificationCodeService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private fileService: FileService,
  ) {}

  public async signUp(
    request: SignUpRequest,
    photo: Express.Multer.File | undefined,
  ) {
    const user = await this.userService.findByEmail(request.email);

    if (user && user.isVerified) {
      throw new BadRequestException('E-mail already registered');
    }

    if (user) {
      await this.userService.deleteByEmail(request.email);
      await this.verificationCodeService.deleteByEmail(request.email);
    }

    const newUser = new User();
    newUser.name = request.name;
    newUser.email = request.email;
    newUser.password = request.password;
    newUser.isVerified = false;
    newUser.role = UserRole.User;
    const persistedUser = await this.userService.create(newUser);

    if (photo) {
      persistedUser.photo = await this.fileService.uploadMulterFile(
        photo,
        FileType.UserAvatar,
        persistedUser._id.toHexString(),
      );

      await this.userService.update(persistedUser);
    }

    const code = await this.verificationCodeService.create(request.email);

    const sendMailOptions: ISendMailOptions = {
      to: request.email,
      subject: 'Verify your email',
      template: 'confirmation-email-template',
      context: {
        confirmationUrl: `${this.environmentConfig.getStringFromEnv('CONFIRMATION_URL')}?token=${code}`,
      },
    };

    this.eventEmitter.emit('email.send', sendMailOptions);
  }

  public async verifyEmail(
    request: VerifyEmailRequest,
  ): Promise<SignInResponse> {
    const verificationCode = await this.verificationCodeService.findByCode(
      request.code,
    );

    if (!verificationCode) {
      throw new BadRequestException('Invalid code');
    }

    if (verificationCode.expiresAt < new Date()) {
      throw new BadRequestException('Code expired');
    }

    await this.userService.updateIsVerified(verificationCode.email, true);

    await this.verificationCodeService.delete(verificationCode._id);

    const user = (await this.userService.findByEmailAndIsVerified(
      verificationCode.email,
      true,
    )) as UserDocument;

    this.eventEmitter.emit('user.verified', user);

    return await this.createSignInResponse(user);
  }

  public async signIn(request: SignInRequest): Promise<SignInResponse> {
    const user = await this.userService.findByEmailAndIsVerified(
      request.email,
      true,
    );

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.createSignInResponse(user);
  }

  public async validateUser(
    username: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.userService.findByEmailAndIsVerified(
      username,
      true,
    );

    if (!user) {
      return null;
    }

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.userService.responseFromUser(user);
  }

  public async refreshAccessToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshAccessTokenResponse> {
    const refreshTokenRequest =
      await this.refreshTokenService.findByRefreshToken(request.refreshToken);

    if (!refreshTokenRequest) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = Types.ObjectId.createFromHexString(
      refreshTokenRequest.userId,
    );
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      sub: user._id.toHexString(),
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    const response = new RefreshAccessTokenResponse();
    response.accessToken = accessToken;
    return response;
  }

  public async invalidateToken(user: UserDocument) {
    try {
      await this.refreshTokenService.invalidate(user._id.toHexString());
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async createSignInResponse(
    user: UserDocument,
  ): Promise<SignInResponse> {
    const payload = {
      sub: user._id.toHexString(),
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    await this.refreshTokenService.create(payload.sub, refreshToken);

    const response = new SignInResponse();
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
    response.user = await this.userService.responseFromUser(user);

    return response;
  }
}
