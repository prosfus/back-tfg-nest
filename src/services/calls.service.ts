import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Call {
  callId: string;
  userIds: string[];
}

@Injectable()
export class CallsService {
  private calls = [] as Call[];

  createCall(userId: string) {
    const callId = uuidv4();
    console.log('Creating call for ', userId);

    const call = {
      callId,
      userIds: [userId],
    } as Call;

    this.calls.push(call);

    return call;
  }

  addUserToCall(callId: string, userId: string) {
    const callToChange = this.findCall(callId);

    callToChange.userIds = [
      ...callToChange.userIds.filter((id) => id !== userId),
      userId,
    ];

    this.updateCall(callToChange);
    return callToChange;
  }

  removeUserFromCall(callId: string, userId: string) {
    const callToChange = this.findCall(callId);

    callToChange.userIds = callToChange.userIds?.filter((id) => id !== userId);
    this.updateCall(callToChange);
    return callToChange;
  }

  getAllCalls() {
    return [...this.calls];
  }

  updateCall(callToUpdate: Call) {
    const newCalls = [
      ...this.calls.map((call) => {
        if (call.callId !== callToUpdate.callId) return call;

        return callToUpdate;
      }),
    ];

    this.calls = newCalls;
  }

  findCall(callId: string) {
    return this.calls.find((c) => c.callId === callId);
  }
}
