import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketWorkLogsService } from './ticket-work-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Ticket Work Logs')
@ApiBearerAuth()
@Controller('ticket-work-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketWorkLogsController {
  constructor(private readonly workLogsService: TicketWorkLogsService) {}

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener historial de trabajo de un ticket' })
  @ApiResponse({ status: 200, description: 'Historial de trabajo' })
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.workLogsService.findByTicket(ticketId);
  }

  @Get('ticket/:ticketId/total-time')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener tiempo total de trabajo de un ticket' })
  @ApiResponse({ status: 200, description: 'Tiempo total y número de intentos' })
  getTotalTime(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.workLogsService.getTotalTime(ticketId);
  }
}