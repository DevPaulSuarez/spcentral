import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketStatusHistoryService } from './ticket-status-history.service';
import { TicketStatusHistoryController } from './ticket-status-history.controller';
import { TicketStatusHistory } from './entities/ticket-status-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketStatusHistory])],
  controllers: [TicketStatusHistoryController],
  providers: [TicketStatusHistoryService],
  exports: [TicketStatusHistoryService],
})
export class TicketStatusHistoryModule {}