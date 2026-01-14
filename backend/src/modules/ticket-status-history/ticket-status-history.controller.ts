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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketStatusHistoryService } from './ticket-status-history.service';
import { CreateTicketStatusHistoryDto } from './dto/create-ticket-status-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Ticket Status History')
@ApiBearerAuth()
@Controller('ticket-status-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketStatusHistoryController {
  constructor(private readonly ticketStatusHistoryService: TicketStatusHistoryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Crear historial de estado' })
  @ApiResponse({ status: 201, description: 'Historial creado' })
  create(@Body() createDto: CreateTicketStatusHistoryDto) {
    return this.ticketStatusHistoryService.create(createDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todo el historial (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de historial' })
  findAll() {
    return this.ticketStatusHistoryService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Obtener historial por ID' })
  @ApiResponse({ status: 200, description: 'Historial encontrado' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.findOne(id);
  }

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener historial por ticket' })
  @ApiResponse({ status: 200, description: 'Historial del ticket' })
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketStatusHistoryService.findByTicket(ticketId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar historial (solo ADMIN )' })
  @ApiResponse({ status: 200, description: 'Historial eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.remove(id);
  }
}