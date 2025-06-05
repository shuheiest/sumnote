import { PrismaClient } from '@prisma/client';
import type { UserRepository } from '@domain/repositories/UserRepository';
import type { User } from '@domain/entities/User';

export const createPrismaUserRepository = (prisma: PrismaClient): UserRepository => ({
  findById: async (id: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } : null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } : null;
  },

  findAll: async (): Promise<User[]> => {
    const users = await prisma.user.findMany();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const user = await prisma.user.create({
      data: userData,
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  update: async (id: string, userData: Partial<User>): Promise<User | null> => {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: userData,
      });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
});