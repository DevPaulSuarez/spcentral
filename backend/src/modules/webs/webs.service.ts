import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Web } from './entities/web.entity';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';

@Injectable()
export class WebsService {
  constructor(
    @InjectRepository(Web)
    private websRepository: Repository<Web>,
  ) {}

  async create(createWebDto: CreateWebDto): Promise<Web> {
    const web = this.websRepository.create(createWebDto);
    return this.websRepository.save(web);
  }

  async findAll(): Promise<Web[]> {
    return this.websRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['client'],
    });
  }

  async findOne(id: number): Promise<Web> {
    const web = await this.websRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['client'],
    });

    if (!web) {
      throw new NotFoundException('Web not found');
    }

    return web;
  }

  async findByClient(clientId: number): Promise<Web[]> {
    return this.websRepository.find({
      where: { client_id: clientId, deleted_at: IsNull() },
    });
  }

  async findByUser(userId: number): Promise<Web[]> {
    return this.websRepository.find({
      where: { 
        client: { user_id: userId },
        deleted_at: IsNull() 
      },
      relations: ['client'],
    });
  }

  async update(id: number, updateWebDto: UpdateWebDto): Promise<Web> {
    const web = await this.findOne(id);
    Object.assign(web, updateWebDto);
    return this.websRepository.save(web);
  }

  async remove(id: number): Promise<void> {
    const web = await this.findOne(id);
    web.deleted_at = new Date();
    await this.websRepository.save(web);
  }
}