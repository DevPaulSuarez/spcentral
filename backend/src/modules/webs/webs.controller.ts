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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebsService } from './webs.service';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Webs')
@ApiBearerAuth()
@Controller('webs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebsController {
  constructor(private readonly websService: WebsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear web (solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Web creada' })
  create(@Body() createWebDto: CreateWebDto) {
    return this.websService.create(createWebDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  @ApiOperation({ summary: 'Listar webs' })
  @ApiResponse({ status: 200, description: 'Lista de webs' })
  findAll(@Request() req) {
    if (req.user.role === UserRole.CLIENT) {
      return this.websService.findByUser(req.user.id);
    }
    return this.websService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener web por ID' })
  @ApiResponse({ status: 200, description: 'Web encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.websService.findOne(id);
  }

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener webs por cliente' })
  @ApiResponse({ status: 200, description: 'Webs del cliente' })
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.websService.findByClient(clientId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar web (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Web actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWebDto: UpdateWebDto,
  ) {
    return this.websService.update(id, updateWebDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar web (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Web eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.websService.remove(id);
  }
}