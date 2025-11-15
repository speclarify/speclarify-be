import { Injectable } from '@nestjs/common';
import { VerificationCodeRepository } from './verification-code.repository';
import {
  VerificationCode,
  VerificationCodeDocument,
} from './verification-code.schema';
import { Optional } from '../../util/optional';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VerificationCodeService {
  constructor(private verificationCodeRepository: VerificationCodeRepository) {}

  public async create(email: string): Promise<string> {
    const code = uuidv4();
    const verificationCode = new VerificationCode();
    verificationCode.email = email;
    verificationCode.code = code;
    verificationCode.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);

    await this.verificationCodeRepository.create(verificationCode);

    return code;
  }

  public async deleteByEmail(email: string) {
    return this.verificationCodeRepository.deleteByEmail(email);
  }

  public async findByEmailAndCode(
    email: string,
    code: string,
  ): Promise<Optional<VerificationCodeDocument>> {
    return this.verificationCodeRepository.findByEmailAndCode(email, code);
  }

  public async delete(_id: Types.ObjectId) {
    await this.verificationCodeRepository.delete(_id);
  }

  public async findByCode(code: string) {
    return this.verificationCodeRepository.findByCode(code);
  }
}
