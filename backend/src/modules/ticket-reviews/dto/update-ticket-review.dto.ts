import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '../entities/ticket-review.entity';

export class UpdateTicketReviewDto {
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}