import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketCommentsService } from './ticket-comments.service';
import { TicketCommentsController } from './ticket-comments.controller';
import { TicketComment } from './entities/ticket-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketComment])],
  controllers: [TicketCommentsController],
  providers: [TicketCommentsService],
  exports: [TicketCommentsService],
})
export class TicketCommentsModule {}