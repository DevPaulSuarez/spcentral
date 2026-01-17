export class TicketStatsDto {
  total: number;
  open: number;
  inProgress: number;
  inReview: number;
  resolved: number;
  rejected: number;
  critical: number;
  unassigned: number;
  myTickets?: number;
  pendingReview?: number;
}