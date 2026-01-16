import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { TicketComment } from '../../ticket-comments/entities/ticket-comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_attachments')
export class TicketAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket_id: number;

  @Column({ nullable: true })
  comment_id: number;

  @Column()
  user_id: number;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 500 })
  filepath: string;

  @Column({ length: 100 })
  filetype: string;

  @Column()
  filesize: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => TicketComment)
  @JoinColumn({ name: 'comment_id' })
  comment: TicketComment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}