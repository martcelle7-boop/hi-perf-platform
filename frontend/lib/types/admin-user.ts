export type UserRole = 'ADMIN' | 'BO' | 'USER';

export interface AdminUser {
  id: number;
  email: string;
  role: UserRole;
  clientId: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  role: UserRole;
  clientId?: number;
}

export interface UpdateAdminUserRequest {
  email?: string;
  role?: UserRole;
  clientId?: number;
  newPassword?: string;
}
