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

@Controller('webs')
@UseGuards(JwtAuthGuard)
export class WebsController {
  constructor(private readonly websService: WebsService) {}

  @Post()
  create(@Body() createWebDto: CreateWebDto) {
    return this.websService.create(createWebDto);
  }

  @Get()
  findAll() {
    return this.websService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.websService.findOne(id);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.websService.findByClient(clientId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWebDto: UpdateWebDto,
  ) {
    return this.websService.update(id, updateWebDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.websService.remove(id);
  }
}