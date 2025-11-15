import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocument } from './refresh-token.schema';
import { Model } from 'mongoose';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  public async findByUserId(sub: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({ userId: sub }).exec();
  }

  public async deleteByUserId(sub: string) {
    await this.refreshTokenModel.deleteOne({ userId: sub }).exec();
  }

  public async create(sub: string, token: string): Promise<void> {
    await this.refreshTokenModel.create({ userId: sub, token });
  }

  public async findByRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenDocument | null> {
    return this.refreshTokenModel.findOne({ token: refreshToken }).exec();
  }
}
