import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
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

  deleteCall(callId: string) {
    this.calls = this.calls.filter((call) => call.callId !== callId);
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
    if (callToChange.userIds.length <= 1) {
      console.log('Deleting call');
      this.deleteCall(callId);
      return undefined;
    }
    this.updateCall(callToChange);
    return callToChange;
  }

  removeUserFromAnyCall(userId: string, server?: Server) {
    const call = this.calls.find((call) => call.userIds.includes(userId));
    if (call) {
      const newCall = this.removeUserFromCall(call.callId, userId);
      if (server) {
        server.to([...newCall.userIds]).emit('callUpdate', newCall);
      }
    }
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
