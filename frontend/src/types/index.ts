export enum UserRole {
  CLIENT = 'CLIENT',
  DEV = 'DEV',
  ADMIN = 'ADMIN',
  VALIDATOR = 'VALIDATOR',
}

export enum Language {
  ES = 'es',
  EN = 'en',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ReviewStatus {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  language: Language;
  active: boolean;
  created_at: string;
}

export interface Client {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  user?: User;
}

export interface Web {
  id: number;
  client_id: number;
  name: string;
  domain: string;
  active: boolean;
  created_at: string;
  client?: Client;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  web_id: number;
  created_by: number;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  web?: Web;
  creator?: User;
  assignee?: User;
}

export interface TicketReview {
  id: number;
  ticket_id: number;
  reviewer_id: number;
  status: ReviewStatus;
  comment?: string;
  created_at: string;
  ticket?: Ticket;
  reviewer?: User;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}