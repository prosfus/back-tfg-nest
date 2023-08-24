import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';
import { CallsService } from 'src/services/calls.service';
import { UserService } from 'src/services/users.service';

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly callsService: CallsService,
  ) {}

  afterInit() {
    console.log('WebSocket Initialized!');
  }

  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    this.userService.removeUser(client.id);
    this.callsService.removeUserFromAnyCall(client.id, this.server);
    this.emitConnectedUsers();
  }

  emitConnectedUsers() {
    this.server.emit('connectedUsers', this.userService.getAllUsers());
  }

  @SubscribeMessage('hello')
  handleMessage(client: Socket, data: { name: string; id: string }): string {
    this.userService.addUser({ name: data.name, id: client.id });
    console.log('Client connected as: ', data.name);
    this.emitConnectedUsers();
    client.emit('me', client.id);
    return client.id;
  }

  @SubscribeMessage('createCall')
  createCall(
    client: Socket,
    data: { creatorId: string; userToCallId: string },
  ) {
    //Create a new call
    const call = this.callsService.createCall(data.creatorId);

    //Call the user
    this.handleCallUser(client, {
      userToCallId: data.userToCallId,
      callerId: data.creatorId,
      callId: call.callId,
    });

    client.emit('createCall', call);
  }

  @SubscribeMessage('callUser')
  handleCallUser(
    client: Socket,
    data: { userToCallId: string; callerId: string; callId: string },
  ) {
    const call = this.callsService.findCall(data.callId);
    const caller = this.userService.getUser(data.callerId);
    const userToCall = this.userService.getUser(data.userToCallId);

    console.log(`${caller?.id} calling ${userToCall?.id}`);

    this.server.to([...call.userIds, userToCall.id]).emit('callNotification', {
      callId: data.callId,
      caller,
      userToCall,
    });
  }

  @SubscribeMessage('hangupCall')
  handleHangupCall(client: Socket, data: { callId: string }) {
    const oldCall = this.callsService.findCall(data.callId);
    const updatedCall = this.callsService.removeUserFromCall(
      data.callId,
      client.id,
    );
    if (updatedCall) {
      this.server.to([...updatedCall.userIds]).emit('callUpdate', updatedCall);
    } else {
      this.server.to([...oldCall.userIds]).emit('callEnd', data.callId);
    }
  }

  @SubscribeMessage('answerCall')
  handleAnswerCall(client: Socket, data: { callId: string }) {
    const call = this.callsService.addUserToCall(data.callId, client.id);
    this.server.to([...call.userIds]).emit('callUpdate', call);
  }

  @SubscribeMessage('rejectCall')
  handleCloseCall(client: Socket, data: { callId: string }) {
    const call = this.callsService.addUserToCall(data.callId, client.id);
    this.server.to([...call.userIds]).emit('callRejected', { user: client.id });
  }
}
