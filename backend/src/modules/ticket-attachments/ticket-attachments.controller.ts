import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { TicketAttachmentsService } from './ticket-attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { extname, join } from 'path';
import { existsSync } from 'fs';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${uniqueSuffix}${ext}`);
  },
});

@ApiTags('Ticket Attachments')
@ApiBearerAuth()
@Controller('ticket-attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketAttachmentsController {
  constructor(private readonly attachmentsService: TicketAttachmentsService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivo adjunto' })
  @ApiResponse({ status: 201, description: 'Archivo subido' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('ticket_id') ticketId: string,
    @Body('comment_id') commentId: string,
    @Request() req,
  ) {
    const createDto = {
      ticket_id: Number(ticketId),
      comment_id: commentId ? Number(commentId) : undefined,
      filename: file.originalname,
      filepath: file.filename,
      filetype: file.mimetype,
      filesize: file.size,
    };

    return this.attachmentsService.create(createDto, req.user.id);
  }

  @Get('ticket/:ticketId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener archivos de un ticket' })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.attachmentsService.findByTicket(ticketId);
  }

  @Get('comment/:commentId')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Obtener archivos de un comentario' })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  findByComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.attachmentsService.findByComment(commentId);
  }

  @Get('download/:id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Descargar archivo' })
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const attachment = await this.attachmentsService.findOne(id);
    const filepath = join(process.cwd(), 'uploads', attachment.filepath);

    if (!existsSync(filepath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    res.download(filepath, attachment.filename);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Eliminar archivo propio' })
  @ApiResponse({ status: 200, description: 'Archivo eliminado' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.attachmentsService.remove(id, req.user.id);
  }

  @Get('view/:id')
  @Roles(UserRole.ADMIN, UserRole.DEV, UserRole.VALIDATOR, UserRole.CLIENT)
  @ApiOperation({ summary: 'Ver archivo' })
  async view(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const attachment = await this.attachmentsService.findOne(id);
    const filepath = join(process.cwd(), 'uploads', attachment.filepath);

    if (!existsSync(filepath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    res.sendFile(filepath);
  }
}
