export type UserRole = 'ADMIN' | 'BO' | 'USER';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  clientId: number | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
