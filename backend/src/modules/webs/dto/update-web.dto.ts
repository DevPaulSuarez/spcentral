import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWebDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}