import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketCommentsService } from './ticket-comments.service';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Ticket Comments')
@ApiBearerAuth()
@Controller('ticket-comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketCommentsController {
  constructor(private readonly commentsService: TicketCommentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Crear comentario en ticket' })
  @ApiResponse({ status: 201, description: 'Comentario creado' })
  create(@Body() createCommentDto: CreateTicketCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener comentarios de un ticket' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.commentsService.findByTicket(ticketId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Eliminar comentario propio' })
  @ApiResponse({ status: 200, description: 'Comentario eliminado' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.remove(id, req.user.id);
  }
}