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
import { WebsService } from './webs.service';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('webs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebsController {
  constructor(private readonly websService: WebsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createWebDto: CreateWebDto) {
    return this.websService.create(createWebDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEV)
  findAll() {
    return this.websService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.websService.findOne(id);
  }

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.websService.findByClient(clientId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWebDto: UpdateWebDto,
  ) {
    return this.websService.update(id, updateWebDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.websService.remove(id);
  }
}