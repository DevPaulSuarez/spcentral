import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('webs')
export class Web {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  domain: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;
}