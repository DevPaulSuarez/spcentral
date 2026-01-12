import { UserRole, Language } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: Language;
  active: boolean;
  created_at: Date;
}