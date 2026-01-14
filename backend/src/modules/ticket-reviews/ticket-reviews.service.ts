import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TicketReview } from './entities/ticket-review.entity';
import { CreateTicketReviewDto } from './dto/create-ticket-review.dto';
import { UpdateTicketReviewDto } from './dto/update-ticket-review.dto';

@Injectable()
export class TicketReviewsService {
  constructor(
    @InjectRepository(TicketReview)
    private ticketReviewsRepository: Repository<TicketReview>,
  ) {}

  async create(createTicketReviewDto: CreateTicketReviewDto): Promise<TicketReview> {
    const review = this.ticketReviewsRepository.create(createTicketReviewDto);
    return this.ticketReviewsRepository.save(review);
  }

  async findAll(): Promise<TicketReview[]> {
    return this.ticketReviewsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['ticket', 'reviewer'],
    });
  }

  async findOne(id: number): Promise<TicketReview> {
    const review = await this.ticketReviewsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['ticket', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException('Ticket review not found');
    }

    return review;
  }

  async findByTicket(ticketId: number): Promise<TicketReview[]> {
    return this.ticketReviewsRepository.find({
      where: { ticket_id: ticketId, deleted_at: IsNull() },
      relations: ['reviewer'],
    });
  }

  async update(id: number, updateTicketReviewDto: UpdateTicketReviewDto): Promise<TicketReview> {
    const review = await this.findOne(id);
    Object.assign(review, updateTicketReviewDto);
    return this.ticketReviewsRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    review.deleted_at = new Date();
    await this.ticketReviewsRepository.save(review);
  }
}