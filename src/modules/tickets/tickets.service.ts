import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { TicketStatusHistoryService } from '../ticket-status-history/ticket-status-history.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private usersService: UsersService,
    private ticketStatusHistoryService: TicketStatusHistoryService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    if (createTicketDto.assigned_to) {
      await this.validateAssignee(createTicketDto.assigned_to);
    }

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

  async update(id: number, updateTicketDto: UpdateTicketDto, changedBy: number): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (updateTicketDto.assigned_to) {
      await this.validateAssignee(updateTicketDto.assigned_to);
    }

    if (updateTicketDto.status && updateTicketDto.status !== ticket.status) {
      await this.ticketStatusHistoryService.create({
        ticket_id: id,
        old_status: ticket.status,
        new_status: updateTicketDto.status,
        changed_by: changedBy,
      });
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    ticket.deleted_at = new Date();
    await this.ticketsRepository.save(ticket);
  }

  private async validateAssignee(userId: number): Promise<void> {
    const user = await this.usersService.findOne(userId);
    
    if (user.role !== UserRole.DEV) {
      throw new BadRequestException('Tickets can only be assigned to DEV users');
    }
  }
}