import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TicketStatus } from '../../tickets/entities/ticket.entity';

export class CreateTicketStatusHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  ticket_id: number;

  @IsNotEmpty()
  @IsEnum(TicketStatus)
  old_status: TicketStatus;

  @IsNotEmpty()
  @IsEnum(TicketStatus)
  new_status: TicketStatus;

  @IsNotEmpty()
  @IsNumber()
  changed_by: number;
}