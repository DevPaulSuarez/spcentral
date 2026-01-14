import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsNotEmpty()
  @IsNumber()
  web_id: number;

  @IsNotEmpty()
  @IsNumber()
  created_by: number;

  @IsOptional()
  @IsNumber()
  assigned_to?: number;
}