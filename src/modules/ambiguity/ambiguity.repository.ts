import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ambiguity, AmbiguityDocument } from './ambiguity.schema';

@Injectable()
export class AmbiguityRepository {
  constructor(
    @InjectModel(Ambiguity.name) private ambiguityModel: Model<Ambiguity>,
  ) {}

  public async findByRequirementId(
    requirementId: Types.ObjectId,
  ): Promise<AmbiguityDocument | null> {
    return this.ambiguityModel.findOne({ requirement: requirementId }).exec();
  }

  public async save(items: Partial<Ambiguity>): Promise<AmbiguityDocument>;
  public async save(items: Partial<Ambiguity>[]): Promise<AmbiguityDocument[]>;
  public async save(
    items: Partial<Ambiguity> | Partial<Ambiguity>[],
  ): Promise<AmbiguityDocument | AmbiguityDocument[]> {
    return this.ambiguityModel.create(items);
  }
}
