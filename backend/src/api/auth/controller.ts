import { defineController } from './$relay';
import { createAuthUseCases } from '../../application/use-cases/AuthUseCases';
import { createPrismaUserRepository } from '../../infrastructure/database/PrismaUserRepository';
import { createBcryptAuthService } from '../../infrastructure/services/BcryptAuthService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userRepository = createPrismaUserRepository(prisma);
const authService = createBcryptAuthService(process.env.JWT_SECRET || 'secret');
const authUseCases = createAuthUseCases(userRepository, authService);

export default defineController(() => ({
  get: async ({ headers }) => {
    const token = headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return { status: 401, body: { message: 'トークンが必要です', statusCode: 401 } };
    }

    const user = await authUseCases.getCurrentUser(token);
    if (!user) {
      return { status: 401, body: { message: '無効なトークンです', statusCode: 401 } };
    }

    return { status: 200, body: user };
  },
}));