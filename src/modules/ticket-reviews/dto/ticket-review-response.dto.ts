import { ReviewStatus } from '../entities/ticket-review.entity';

export class TicketReviewResponseDto {
  id: number;
  ticket_id: number;
  reviewer_id: number;
  status: ReviewStatus;
  comment: string;
  created_at: Date;
}