import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrganizationMember,
  OrganizationMemberSchema,
} from './organization-member.schema';
import { OrganizationMemberController } from './organization-member.controller';
import { OrganizationMemberService } from './organization-member.service';
import { OrganizationMemberRepository } from './organization-member.repository';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OrganizationMember.name,
        schema: OrganizationMemberSchema,
      },
    ]),
    UserModule,
    OrganizationModule,
  ],
  controllers: [OrganizationMemberController],
  providers: [OrganizationMemberService, OrganizationMemberRepository],
  exports: [OrganizationMemberService],
})
export class OrganizationMemberModule {}
