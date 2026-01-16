import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TicketComment } from './entities/ticket-comment.entity';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';

@Injectable()
export class TicketCommentsService {
  constructor(
    @InjectRepository(TicketComment)
    private commentsRepository: Repository<TicketComment>,
  ) {}

  async create(createCommentDto: CreateTicketCommentDto, userId: number): Promise<TicketComment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      user_id: userId,
    });
    const saved = await this.commentsRepository.save(comment);
    return this.findOne(saved.id);
  }

  async findByTicket(ticketId: number): Promise<TicketComment[]> {
    return this.commentsRepository.find({
      where: { ticket_id: ticketId, deleted_at: IsNull() },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TicketComment> {
    const comment = await this.commentsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);
    
    if (comment.user_id !== userId) {
      throw new NotFoundException('No puedes eliminar comentarios de otros usuarios');
    }

    comment.deleted_at = new Date();
    await this.commentsRepository.save(comment);
  }
}