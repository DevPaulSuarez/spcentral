import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TicketStatusHistory } from './entities/ticket-status-history.entity';
import { CreateTicketStatusHistoryDto } from './dto/create-ticket-status-history.dto';

@Injectable()
export class TicketStatusHistoryService {
  constructor(
    @InjectRepository(TicketStatusHistory)
    private ticketStatusHistoryRepository: Repository<TicketStatusHistory>,
  ) {}

  async create(createDto: CreateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
    const history = this.ticketStatusHistoryRepository.create(createDto);
    return this.ticketStatusHistoryRepository.save(history);
  }

  async findAll(): Promise<TicketStatusHistory[]> {
    return this.ticketStatusHistoryRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['ticket', 'changedByUser'],
    });
  }

  async findOne(id: number): Promise<TicketStatusHistory> {
    const history = await this.ticketStatusHistoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['ticket', 'changedByUser'],
    });

    if (!history) {
      throw new NotFoundException('Ticket status history not found');
    }

    return history;
  }

  async findByTicket(ticketId: number): Promise<TicketStatusHistory[]> {
    return this.ticketStatusHistoryRepository.find({
      where: { ticket_id: ticketId, deleted_at: IsNull() },
      relations: ['changedByUser'],
      order: { changed_at: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    const history = await this.findOne(id);
    history.deleted_at = new Date();
    await this.ticketStatusHistoryRepository.save(history);
  }
}