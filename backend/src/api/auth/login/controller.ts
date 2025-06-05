import { defineController } from './$relay';
import { createAuthUseCases } from '../../../application/use-cases/AuthUseCases';
import { createPrismaUserRepository } from '../../../infrastructure/database/PrismaUserRepository';
import { createBcryptAuthService } from '../../../infrastructure/services/BcryptAuthService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userRepository = createPrismaUserRepository(prisma);
const authService = createBcryptAuthService(process.env.JWT_SECRET || 'secret');
const authUseCases = createAuthUseCases(userRepository, authService);

export default defineController(() => ({
  post: async ({ body }) => {
    try {
      const result = await authUseCases.login(body.email, body.password);
      return { status: 200, body: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      return { status: 401, body: { message, statusCode: 401 } };
    }
  },
}));