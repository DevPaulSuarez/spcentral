import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { CreateTicketAttachmentDto } from './dto/create-ticket-attachment.dto';

@Injectable()
export class TicketAttachmentsService {
  constructor(
    @InjectRepository(TicketAttachment)
    private attachmentsRepository: Repository<TicketAttachment>,
  ) {}

  async create(createAttachmentDto: CreateTicketAttachmentDto, userId: number): Promise<TicketAttachment> {
    const attachment = this.attachmentsRepository.create({
      ...createAttachmentDto,
      user_id: userId,
    });
    const saved = await this.attachmentsRepository.save(attachment);
    return this.findOne(saved.id);
  }

  async findByTicket(ticketId: number): Promise<TicketAttachment[]> {
    return this.attachmentsRepository.find({
      where: { ticket_id: ticketId, deleted_at: IsNull() },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async findByComment(commentId: number): Promise<TicketAttachment[]> {
    return this.attachmentsRepository.find({
      where: { comment_id: commentId, deleted_at: IsNull() },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TicketAttachment> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['user'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async remove(id: number, userId: number): Promise<void> {
    const attachment = await this.findOne(id);

    if (attachment.user_id !== userId) {
      throw new NotFoundException('No puedes eliminar archivos de otros usuarios');
    }

    attachment.deleted_at = new Date();
    await this.attachmentsRepository.save(attachment);
  }
}