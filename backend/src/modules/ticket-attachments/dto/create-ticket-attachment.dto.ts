import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTicketAttachmentDto {
  @IsNotEmpty()
  @IsNumber()
  ticket_id: number;

  @IsOptional()
  @IsNumber()
  comment_id?: number;

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  filepath: string;

  @IsNotEmpty()
  @IsString()
  filetype: string;

  @IsNotEmpty()
  @IsNumber()
  filesize: number;
}