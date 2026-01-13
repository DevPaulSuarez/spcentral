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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('ticket-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketReviewsController {
  constructor(private readonly ticketReviewsService: TicketReviewsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR)
  create(@Body() createTicketReviewDto: CreateTicketReviewDto) {
    return this.ticketReviewsService.create(createTicketReviewDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.DEV)
  findAll() {
    return this.ticketReviewsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.DEV)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketReviewsService.findOne(id);
  }

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.DEV, UserRole.CLIENT)
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketReviewsService.findByTicket(ticketId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketReviewDto: UpdateTicketReviewDto,
  ) {
    return this.ticketReviewsService.update(id, updateTicketReviewDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketReviewsService.remove(id);
  }
}