import { User } from '../entities/User';

export interface AuthService {
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
  generateToken: (user: User) => Promise<string>;
  verifyToken: (token: string) => Promise<User | null>;
}

export const createAuthService = (dependencies: {
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
  generateToken: (user: User) => Promise<string>;
  verifyToken: (token: string) => Promise<User | null>;
}): AuthService => dependencies;