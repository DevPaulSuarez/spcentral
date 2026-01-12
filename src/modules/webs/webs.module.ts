import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsService } from './webs.service';
import { WebsController } from './webs.controller';
import { Web } from './entities/web.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Web])],
  controllers: [WebsController],
  providers: [WebsService],
  exports: [WebsService],
})
export class WebsModule {}