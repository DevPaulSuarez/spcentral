import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { UsersModule } from '../users/users.module';
import { TicketStatusHistoryModule } from '../ticket-status-history/ticket-status-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    UsersModule,
    TicketStatusHistoryModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}