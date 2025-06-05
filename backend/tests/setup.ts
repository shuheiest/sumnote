import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Database setup if needed
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Global test utilities
global.testPrisma = prisma;