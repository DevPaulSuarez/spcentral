import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TicketStatusHistoryService } from './ticket-status-history.service';
import { CreateTicketStatusHistoryDto } from './dto/create-ticket-status-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ticket-status-history')
@UseGuards(JwtAuthGuard)
export class TicketStatusHistoryController {
  constructor(private readonly ticketStatusHistoryService: TicketStatusHistoryService) {}

  @Post()
  create(@Body() createDto: CreateTicketStatusHistoryDto) {
    return this.ticketStatusHistoryService.create(createDto);
  }

  @Get()
  findAll() {
    return this.ticketStatusHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.findOne(id);
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketStatusHistoryService.findByTicket(ticketId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.remove(id);
  }
}