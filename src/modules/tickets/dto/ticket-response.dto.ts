import { TicketStatus, TicketPriority } from '../entities/ticket.entity';

export class TicketResponseDto {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  web_id: number;
  created_by: number;
  assigned_to: number;
  created_at: Date;
  updated_at: Date;
}