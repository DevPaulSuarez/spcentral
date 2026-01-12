import { TicketStatus } from '../../tickets/entities/ticket.entity';

export class TicketStatusHistoryResponseDto {
  id: number;
  ticket_id: number;
  old_status: TicketStatus;
  new_status: TicketStatus;
  changed_by: number;
  changed_at: Date;
}