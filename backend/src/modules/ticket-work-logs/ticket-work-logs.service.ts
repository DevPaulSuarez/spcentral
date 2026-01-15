import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketWorkLog, WorkLogStatus } from './entities/ticket-work-log.entity';

@Injectable()
export class TicketWorkLogsService {
  constructor(
    @InjectRepository(TicketWorkLog)
    private workLogsRepository: Repository<TicketWorkLog>,
  ) {}

  async startWork(ticketId: number, devId: number): Promise<TicketWorkLog> {
    const workLog = this.workLogsRepository.create({
      ticket_id: ticketId,
      dev_id: devId,
      started_at: new Date(),
      status: WorkLogStatus.IN_PROGRESS,
    });
    return this.workLogsRepository.save(workLog);
  }

  async finishWork(ticketId: number, devId: number): Promise<TicketWorkLog> {
    const workLog = await this.findActiveLog(ticketId, devId);
    workLog.finished_at = new Date();
    workLog.status = WorkLogStatus.COMPLETED;
    return this.workLogsRepository.save(workLog);
  }

  async rejectWork(ticketId: number, reason: string): Promise<TicketWorkLog> {
    const workLog = await this.workLogsRepository.findOne({
      where: { ticket_id: ticketId, status: WorkLogStatus.COMPLETED },
      order: { created_at: 'DESC' },
    });

    if (!workLog) {
      throw new NotFoundException('Work log not found');
    }

    workLog.status = WorkLogStatus.REJECTED;
    workLog.rejection_reason = reason;
    return this.workLogsRepository.save(workLog);
  }

  async findByTicket(ticketId: number): Promise<TicketWorkLog[]> {
    return this.workLogsRepository.find({
      where: { ticket_id: ticketId },
      relations: ['dev'],
      order: { created_at: 'ASC' },
    });
  }

  async findActiveLog(ticketId: number, devId: number): Promise<TicketWorkLog> {
    const workLog = await this.workLogsRepository.findOne({
      where: { ticket_id: ticketId, dev_id: devId, status: WorkLogStatus.IN_PROGRESS },
    });

    if (!workLog) {
      throw new NotFoundException('Active work log not found');
    }

    return workLog;
  }

  async getTotalTime(ticketId: number): Promise<{ totalMinutes: number; attempts: number }> {
    const logs = await this.findByTicket(ticketId);
    
    let totalMinutes = 0;
    let attempts = logs.length;

    for (const log of logs) {
      if (log.started_at && log.finished_at) {
        const diff = new Date(log.finished_at).getTime() - new Date(log.started_at).getTime();
        totalMinutes += Math.floor(diff / (1000 * 60));
      }
    }

    return { totalMinutes, attempts };
  }
}