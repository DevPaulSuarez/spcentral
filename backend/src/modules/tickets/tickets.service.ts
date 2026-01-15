import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { TicketStatusHistoryService } from '../ticket-status-history/ticket-status-history.service';
import { TicketWorkLogsService } from '../ticket-work-logs/ticket-work-logs.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private usersService: UsersService,
    private ticketStatusHistoryService: TicketStatusHistoryService,
    private ticketWorkLogsService: TicketWorkLogsService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    if (createTicketDto.assigned_to) {
      await this.validateAssignee(createTicketDto.assigned_to);
    }

    const ticket = this.ticketsRepository.create(createTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async findAll(filterDto?: FilterTicketDto): Promise<{ data: Ticket[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { deleted_at: IsNull() };

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    if (filterDto?.priority) {
      where.priority = filterDto.priority;
    }

    if (filterDto?.web_id) {
      where.web_id = filterDto.web_id;
    }

    if (filterDto?.assigned_to) {
      where.assigned_to = filterDto.assigned_to;
    }

    const [data, total] = await this.ticketsRepository.findAndCount({
      where,
      relations: ['web', 'creator', 'assignee'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findAllByUser(userId: number, filterDto?: FilterTicketDto): Promise<{ data: Ticket[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { created_by: userId, deleted_at: IsNull() };

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    if (filterDto?.priority) {
      where.priority = filterDto.priority;
    }

    const [data, total] = await this.ticketsRepository.findAndCount({
      where,
      relations: ['web', 'creator', 'assignee'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total, page, limit };
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

  async startTicket(id: number, userId: number): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.OPEN && ticket.status !== TicketStatus.REJECTED) {
      throw new BadRequestException('Solo se pueden iniciar tickets en estado OPEN o REJECTED');
    }

    if (ticket.assigned_to !== userId) {
      throw new BadRequestException('Solo el DEV asignado puede iniciar el ticket');
    }

    await this.ticketStatusHistoryService.create({
      ticket_id: id,
      old_status: ticket.status,
      new_status: TicketStatus.IN_PROGRESS,
      changed_by: userId,
    });

    await this.ticketWorkLogsService.startWork(id, userId);

    ticket.status = TicketStatus.IN_PROGRESS;

    return this.ticketsRepository.save(ticket);
  }

  async finishTicket(id: number, userId: number): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.IN_PROGRESS) {
      throw new BadRequestException('Solo se pueden finalizar tickets en estado IN_PROGRESS');
    }

    if (ticket.assigned_to !== userId) {
      throw new BadRequestException('Solo el DEV asignado puede finalizar el ticket');
    }

    await this.ticketStatusHistoryService.create({
      ticket_id: id,
      old_status: ticket.status,
      new_status: TicketStatus.IN_REVIEW,
      changed_by: userId,
    });

    await this.ticketWorkLogsService.finishWork(id, userId);

    ticket.status = TicketStatus.IN_REVIEW;

    return this.ticketsRepository.save(ticket);
  }

  async rejectTicket(id: number, userId: number, reason: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.IN_REVIEW) {
      throw new BadRequestException('Solo se pueden rechazar tickets en estado IN_REVIEW');
    }

    await this.ticketStatusHistoryService.create({
      ticket_id: id,
      old_status: ticket.status,
      new_status: TicketStatus.REJECTED,
      changed_by: userId,
    });

    await this.ticketWorkLogsService.rejectWork(id, reason);

    ticket.status = TicketStatus.REJECTED;

    return this.ticketsRepository.save(ticket);
  }

  async approveTicket(id: number, userId: number): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.IN_REVIEW) {
      throw new BadRequestException('Solo se pueden aprobar tickets en estado IN_REVIEW');
    }

    await this.ticketStatusHistoryService.create({
      ticket_id: id,
      old_status: ticket.status,
      new_status: TicketStatus.RESOLVED,
      changed_by: userId,
    });

    ticket.status = TicketStatus.RESOLVED;

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