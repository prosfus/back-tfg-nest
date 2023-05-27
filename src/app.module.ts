import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events/events.gateway';
import { UserService } from './services/users.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, EventsGateway, UserService],
})
export class AppModule {}
