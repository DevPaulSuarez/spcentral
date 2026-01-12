import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TicketReviewsService } from './ticket-reviews.service';
import { CreateTicketReviewDto } from './dto/create-ticket-review.dto';
import { UpdateTicketReviewDto } from './dto/update-ticket-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ticket-reviews')
@UseGuards(JwtAuthGuard)
export class TicketReviewsController {
  constructor(private readonly ticketReviewsService: TicketReviewsService) {}

  @Post()
  create(@Body() createTicketReviewDto: CreateTicketReviewDto) {
    return this.ticketReviewsService.create(createTicketReviewDto);
  }

  @Get()
  findAll() {
    return this.ticketReviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketReviewsService.findOne(id);
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketReviewsService.findByTicket(ticketId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketReviewDto: UpdateTicketReviewDto,
  ) {
    return this.ticketReviewsService.update(id, updateTicketReviewDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketReviewsService.remove(id);
  }
}