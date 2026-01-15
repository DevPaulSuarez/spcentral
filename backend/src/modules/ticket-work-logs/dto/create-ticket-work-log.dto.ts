import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTicketWorkLogDto {
  @IsNotEmpty()
  @IsNumber()
  ticket_id: number;

  @IsNotEmpty()
  @IsNumber()
  dev_id: number;
}