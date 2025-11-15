import { Injectable } from '@nestjs/common';
import { DispatchGateway } from './dispatch.gateway';

@Injectable()
export class DispatchService {
  constructor(private dispatchGateway: DispatchGateway) {}

  public async dispatchAction(
    userId: string,
    actionType: string,
    data: any,
  ): Promise<void> {
    await this.dispatchGateway.dispatchAction(userId, actionType, data);
  }
}
