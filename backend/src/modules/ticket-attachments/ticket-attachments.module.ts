import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketAttachmentsService } from './ticket-attachments.service';
import { TicketAttachmentsController } from './ticket-attachments.controller';
import { TicketAttachment } from './entities/ticket-attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketAttachment])],
  controllers: [TicketAttachmentsController],
  providers: [TicketAttachmentsService],
  exports: [TicketAttachmentsService],
})
export class TicketAttachmentsModule {}