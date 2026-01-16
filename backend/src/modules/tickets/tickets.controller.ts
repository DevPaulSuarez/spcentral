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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Crear ticket (ADMIN, CLIENT)' })
  @ApiResponse({ status: 201, description: 'Ticket creado' })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Listar tickets con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de tickets paginada' })
  findAll(@Query() filterDto: FilterTicketDto, @Request() req) {
    if (req.user.role === UserRole.CLIENT) {
      return this.ticketsService.findAllByUser(req.user.id, filterDto);
    }
    if (req.user.role === UserRole.DEV) {
      return this.ticketsService.findAllByAssignee(req.user.id, filterDto);
    }
    if (req.user.role === UserRole.VALIDATOR) {
      return this.ticketsService.findAllByValidator(req.user.id, filterDto);
    }
    return this.ticketsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Get('web/:webId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener tickets por web' })
  findByWeb(@Param('webId', ParseIntPipe) webId: number) {
    return this.ticketsService.findByWeb(webId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener tickets por usuario creador' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketsService.findByUser(userId);
  }

  @Get('assignee/:userId')
  @Roles(UserRole.ADMIN, UserRole.DEV)
  @ApiOperation({ summary: 'Obtener tickets asignados a un DEV' })
  findByAssignee(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketsService.findByAssignee(userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar ticket (ADMIN)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id);
  }

  @Patch(':id/start')
  @Roles(UserRole.DEV)
  @ApiOperation({ summary: 'Iniciar ticket (solo DEV asignado)' })
  @ApiResponse({ status: 200, description: 'Ticket iniciado' })
  startTicket(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ticketsService.startTicket(id, req.user.id);
  }

  @Patch(':id/finish')
  @Roles(UserRole.DEV)
  @ApiOperation({ summary: 'Finalizar ticket (solo DEV asignado)' })
  @ApiResponse({ status: 200, description: 'Ticket enviado a revisión' })
  finishTicket(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ticketsService.finishTicket(id, req.user.id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Aprobar ticket (ADMIN, VALIDATOR asignado)' })
  @ApiResponse({ status: 200, description: 'Ticket aprobado' })
  approveTicket(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ticketsService.approveTicket(id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Rechazar ticket (ADMIN, VALIDATOR asignado)' })
  @ApiResponse({ status: 200, description: 'Ticket rechazado' })
  rejectTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.ticketsService.rejectTicket(id, req.user.id, reason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar ticket (solo ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }
}