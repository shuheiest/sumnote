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
      const result = await authUseCases.register(body.email, body.name, body.password);
      return { status: 201, body: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ユーザー登録に失敗しました';
      return { status: 400, body: { message, statusCode: 400 } };
    }
  },
}));