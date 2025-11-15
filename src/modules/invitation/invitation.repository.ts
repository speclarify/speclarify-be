import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invitation, InvitationDocument } from './invitation.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class InvitationRepository {
  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<Invitation>,
  ) {}

  public async create(invitation: Invitation): Promise<void> {
    await this.invitationModel.create(invitation);
  }

  public async findByEmail(email: string): Promise<InvitationDocument[]> {
    return this.invitationModel.find({ email }).exec();
  }

  public async deleteById(_id: Types.ObjectId): Promise<void> {
    await this.invitationModel.deleteOne({ _id }).exec();
  }
}
