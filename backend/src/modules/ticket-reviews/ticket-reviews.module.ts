import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketReviewsService } from './ticket-reviews.service';
import { TicketReviewsController } from './ticket-reviews.controller';
import { TicketReview } from './entities/ticket-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketReview])],
  controllers: [TicketReviewsController],
  providers: [TicketReviewsService],
  exports: [TicketReviewsService],
})
export class TicketReviewsModule {}