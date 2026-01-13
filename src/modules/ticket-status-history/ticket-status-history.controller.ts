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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('ticket-status-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketStatusHistoryController {
  constructor(private readonly ticketStatusHistoryService: TicketStatusHistoryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR)
  create(@Body() createDto: CreateTicketStatusHistoryDto) {
    return this.ticketStatusHistoryService.create(createDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ticketStatusHistoryService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.findOne(id);
  }

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketStatusHistoryService.findByTicket(ticketId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.remove(id);
  }
}