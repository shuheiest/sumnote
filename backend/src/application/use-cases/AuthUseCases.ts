import type { UserRepository } from '@domain/repositories/UserRepository';
import type { AuthService } from '@domain/services/AuthService';
import type { User } from '@domain/entities/User';
import { createUser } from '@domain/entities/User';

export type AuthUseCases = {
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (email: string, name: string, password: string) => Promise<{ user: User; token: string }>;
  getCurrentUser: (token: string) => Promise<User | null>;
};

export const createAuthUseCases = (
  userRepository: UserRepository,
  authService: AuthService
): AuthUseCases => ({
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('パスワードが間違っています');
    }

    const token = await authService.generateToken(user);
    return { user, token };
  },

  register: async (email: string, name: string, password: string): Promise<{ user: User; token: string }> => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    const hashedPassword = await authService.hashPassword(password);
    const userData = {
      email,
      name,
      password: hashedPassword,
      role: 'user',
    };

    const user = await userRepository.create(userData);
    const token = await authService.generateToken(user);
    return { user, token };
  },

  getCurrentUser: async (token: string): Promise<User | null> => {
    const userInfo = await authService.verifyToken(token);
    if (!userInfo) {
      return null;
    }

    return userRepository.findById(userInfo.id);
  },
});