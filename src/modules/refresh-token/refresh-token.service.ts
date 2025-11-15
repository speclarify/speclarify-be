import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';

@Injectable()
export class RefreshTokenService {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  public async validate(sub: string, token: string) {
    const refreshToken = await this.refreshTokenRepository.findByUserId(sub);

    if (!refreshToken) {
      return false;
    }

    return refreshToken.token === token;
  }

  public async invalidate(sub: string) {
    await this.refreshTokenRepository.deleteByUserId(sub);
  }

  public async create(sub: string, token: string) {
    await this.refreshTokenRepository.create(sub, token);
  }

  public async findByRefreshToken(refreshToken: string) {
    return this.refreshTokenRepository.findByRefreshToken(refreshToken);
  }
}
