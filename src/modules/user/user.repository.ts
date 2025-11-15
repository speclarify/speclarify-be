import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { GetAllUsersQuery } from './dto/get-all-users.query';
import { PageResponse } from '../../dto/page.response';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findByEmailAndIsVerified(
    email: string,
    isVerified: boolean,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isVerified }).exec();
  }

  public async save(user: User) {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  public async updateIsVerified(email: string, b: boolean) {
    await this.userModel.updateOne({ email }, { isVerified: b }).exec();
  }

  public findById(objectId: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: objectId }).exec();
  }

  public findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async deleteByEmail(email: string) {
    await this.userModel.deleteOne({ email }).exec();
  }

  public async getAll(
    query: GetAllUsersQuery,
  ): Promise<PageResponse<UserDocument>> {
    const filter: FilterQuery<UserDocument> = {
      name: { $regex: query.search, $options: 'i' },
    };

    const count = await this.userModel.find(filter).countDocuments().exec();

    const users = await this.userModel
      .find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort({ createdAt: -1 })
      .exec();

    return new PageResponse<UserDocument>(
      users,
      count,
      query.pageNumber,
      query.pageSize,
    );
  }
}
