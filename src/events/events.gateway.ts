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
import { UserService } from 'src/services/users.service';

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}

  afterInit() {
    console.log('WebSocket Initialized!');
  }

  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    this.userService.removeUser(client.id);
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

  @SubscribeMessage('callUser')
  handleCallUser(
    client: Socket,
    data: { userToCall: string; signalData: any; from: string; name: string },
  ) {
    this.server.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  }

  @SubscribeMessage('answerCall')
  handleAnswerCall(client: Socket, data: { signal: any; to: string }) {
    this.server.to(data.to).emit('callAccepted', data.signal);
  }

  @SubscribeMessage('hangupCall')
  handleCloseCall(client: Socket, data: { to: string }) {
    this.server.to(data.to).emit('callEnded', { connectionId: data.to });
  }
}
