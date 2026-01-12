import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create(createTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['web', 'creator', 'assignee'],
    });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['web', 'creator', 'assignee'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async findByWeb(webId: number): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { web_id: webId, deleted_at: IsNull() },
      relations: ['creator', 'assignee'],
    });
  }

  async findByUser(userId: number): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { created_by: userId, deleted_at: IsNull() },
      relations: ['web', 'assignee'],
    });
  }

  async findByAssignee(userId: number): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { assigned_to: userId, deleted_at: IsNull() },
      relations: ['web', 'creator'],
    });
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    Object.assign(ticket, updateTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    ticket.deleted_at = new Date();
    await this.ticketsRepository.save(ticket);
  }
}