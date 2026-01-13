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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketReviewsService } from './ticket-reviews.service';
import { CreateTicketReviewDto } from './dto/create-ticket-review.dto';
import { UpdateTicketReviewDto } from './dto/update-ticket-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Ticket Reviews')
@ApiBearerAuth()
@Controller('ticket-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketReviewsController {
  constructor(private readonly ticketReviewsService: TicketReviewsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Crear review (ADMIN, VALIDATOR)' })
  @ApiResponse({ status: 201, description: 'Review creada' })
  create(@Body() createTicketReviewDto: CreateTicketReviewDto) {
    return this.ticketReviewsService.create(createTicketReviewDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.DEV)
  @ApiOperation({ summary: 'Listar reviews' })
  @ApiResponse({ status: 200, description: 'Lista de reviews' })
  findAll() {
    return this.ticketReviewsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.DEV)
  @ApiOperation({ summary: 'Obtener review por ID' })
  @ApiResponse({ status: 200, description: 'Review encontrada' })
  @ApiResponse({ status: 404, description: 'Review no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketReviewsService.findOne(id);
  }

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.DEV, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener reviews por ticket' })
  @ApiResponse({ status: 200, description: 'Reviews del ticket' })
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketReviewsService.findByTicket(ticketId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR)
  @ApiOperation({ summary: 'Actualizar review (ADMIN, VALIDATOR)' })
  @ApiResponse({ status: 200, description: 'Review actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketReviewDto: UpdateTicketReviewDto,
  ) {
    return this.ticketReviewsService.update(id, updateTicketReviewDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar review (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Review eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketReviewsService.remove(id);
  }
}