import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketWorkLogsService } from './ticket-work-logs.service';
import { TicketWorkLogsController } from './ticket-work-logs.controller';
import { TicketWorkLog } from './entities/ticket-work-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketWorkLog])],
  controllers: [TicketWorkLogsController],
  providers: [TicketWorkLogsService],
  exports: [TicketWorkLogsService],
})
export class TicketWorkLogsModule {}