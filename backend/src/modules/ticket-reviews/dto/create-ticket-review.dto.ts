import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '../entities/ticket-review.entity';

export class CreateTicketReviewDto {
  @IsNotEmpty()
  @IsNumber()
  ticket_id: number;

  @IsNotEmpty()
  @IsNumber()
  reviewer_id: number;

  @IsNotEmpty()
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}