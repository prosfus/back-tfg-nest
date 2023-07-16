import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events/events.gateway';
import { UserService } from './services/users.service';
import { CallsService } from './services/calls.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, EventsGateway, UserService, CallsService],
})
export class AppModule {}
