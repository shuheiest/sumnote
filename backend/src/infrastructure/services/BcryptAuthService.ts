import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthService } from '@domain/services/AuthService';
import type { User } from '@domain/entities/User';

export const createBcryptAuthService = (jwtSecret: string): AuthService => ({
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  },

  comparePassword: async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
  },

  generateToken: async (user: User): Promise<string> => {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  },

  verifyToken: async (token: string): Promise<User | null> => {
    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        email: string;
        role: string;
      };
      return {
        id: decoded.id,
        email: decoded.email,
        name: '',
        password: '',
        role: decoded.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch {
      return null;
    }
  },
});