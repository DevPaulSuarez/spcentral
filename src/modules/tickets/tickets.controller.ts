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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Listar tickets con filtros y paginación' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'REJECTED'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'web_id', required: false, type: Number })
  @ApiQuery({ name: 'assigned_to', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de tickets paginada' })
  findAll(@Query() filterDto: FilterTicketDto) {
    return this.ticketsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Get('web/:webId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener tickets por web' })
  @ApiResponse({ status: 200, description: 'Tickets de la web' })
  findByWeb(@Param('webId', ParseIntPipe) webId: number) {
    return this.ticketsService.findByWeb(webId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener tickets por usuario creador' })
  @ApiResponse({ status: 200, description: 'Tickets del usuario' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketsService.findByUser(userId);
  }

  @Get('assignee/:userId')
  @Roles(UserRole.ADMIN, UserRole.DEV)
  @ApiOperation({ summary: 'Obtener tickets asignados a un DEV' })
  @ApiResponse({ status: 200, description: 'Tickets asignados' })
  findByAssignee(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketsService.findByAssignee(userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV)
  @ApiOperation({ summary: 'Actualizar ticket (ADMIN, DEV)' })
  @ApiResponse({ status: 200, description: 'Ticket actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar ticket (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Ticket eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }
}