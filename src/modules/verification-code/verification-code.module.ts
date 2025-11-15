import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './verification-code.schema';
import { VerificationCodeRepository } from './verification-code.repository';
import { VerificationCodeService } from './verification-code.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: VerificationCode.name,
        schema: VerificationCodeSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [VerificationCodeService, VerificationCodeRepository],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
