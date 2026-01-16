import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTicketCommentDto {
  @IsNotEmpty()
  @IsNumber()
  ticket_id: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}


