export type UserRole = 'admin' | 'patient' | 'therapist';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}