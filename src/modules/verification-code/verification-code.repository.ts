import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VerificationCode,
  VerificationCodeDocument,
} from './verification-code.schema';
import { Model, Types } from 'mongoose';
import { Optional } from '../../util/optional';

@Injectable()
export class VerificationCodeRepository {
  constructor(
    @InjectModel(VerificationCode.name)
    private verificationCodeModel: Model<VerificationCodeDocument>,
  ) {}

  public async create(verificationCode: VerificationCode) {
    await this.verificationCodeModel.create(verificationCode);
  }

  public async findByCode(
    code: string,
  ): Promise<VerificationCodeDocument | null> {
    return this.verificationCodeModel.findOne({ code }).exec();
  }

  public async deleteByCode(code: string) {
    await this.verificationCodeModel.deleteOne({ code }).exec();
  }

  public async deleteByEmail(email: string) {
    await this.verificationCodeModel.deleteOne({ email }).exec();
  }

  public async findByEmailAndCode(
    email: string,
    code: string,
  ): Promise<Optional<VerificationCodeDocument>> {
    return Optional.ofNullable(
      await this.verificationCodeModel.findOne({ email, code }).exec(),
    );
  }

  public async delete(_id: Types.ObjectId): Promise<void> {
    await this.verificationCodeModel.deleteOne({ _id }).exec();
  }
}
