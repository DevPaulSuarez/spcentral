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
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR)
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Get('web/:webId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  findByWeb(@Param('webId', ParseIntPipe) webId: number) {
    return this.ticketsService.findByWeb(webId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketsService.findByUser(userId);
  }

  @Get('assignee/:userId')
  @Roles(UserRole.ADMIN, UserRole.DEV)
  findByAssignee(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketsService.findByAssignee(userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }
}