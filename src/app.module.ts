import { Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { UserService } from './services/users.service';
import { CallsService } from './services/calls.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventsGateway, UserService, CallsService],
})
export class AppModule {}
