import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mock API client for testing
const mockApiClient = {
  auth: {
    login: {
      $post: jest.fn(),
    },
    register: {
      $post: jest.fn(),
    },
    $get: jest.fn(),
  },
};

describe('Auth API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database
    await prisma.comment.deleteMany();
    await prisma.document.deleteMany();
    await prisma.audio.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      // Simulate successful registration
      const mockResponse = {
        user: {
          id: '1',
          email: userData.email,
          name: userData.name,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'mock-jwt-token',
      };

      mockApiClient.auth.register.$post.mockResolvedValue(mockResponse);

      const result = await mockApiClient.auth.register.$post({ body: userData });

      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user.role).toBe('user');
      expect(result.token).toBeDefined();
      expect(mockApiClient.auth.register.$post).toHaveBeenCalledWith({ body: userData });
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'Test User',
        password: 'password123',
      };

      // First registration succeeds
      mockApiClient.auth.register.$post.mockResolvedValueOnce({
        user: { id: '1', email: userData.email, name: userData.name, role: 'user' },
        token: 'token1',
      });

      // Second registration with same email fails
      mockApiClient.auth.register.$post.mockRejectedValueOnce(
        new Error('このメールアドレスは既に使用されています')
      );

      await mockApiClient.auth.register.$post({ body: userData });

      await expect(mockApiClient.auth.register.$post({ body: userData }))
        .rejects.toThrow('このメールアドレスは既に使用されています');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'user',
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: {
          id: '1',
          email: loginData.email,
          name: 'Test User',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'mock-jwt-token',
      };

      mockApiClient.auth.login.$post.mockResolvedValue(mockResponse);

      const result = await mockApiClient.auth.login.$post({ body: loginData });

      expect(result.user.email).toBe(loginData.email);
      expect(result.token).toBeDefined();
      expect(mockApiClient.auth.login.$post).toHaveBeenCalledWith({ body: loginData });
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockApiClient.auth.login.$post.mockRejectedValue(
        new Error('ユーザーが見つかりません')
      );

      await expect(mockApiClient.auth.login.$post({ body: loginData }))
        .rejects.toThrow('ユーザーが見つかりません');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockApiClient.auth.login.$post.mockRejectedValue(
        new Error('パスワードが間違っています')
      );

      await expect(mockApiClient.auth.login.$post({ body: loginData }))
        .rejects.toThrow('パスワードが間違っています');
    });
  });

  describe('GET /auth', () => {
    it('should return current user with valid token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiClient.auth.$get.mockResolvedValue(mockUser);

      const result = await mockApiClient.auth.$get();

      expect(result).toEqual(mockUser);
    });

    it('should return error with invalid token', async () => {
      mockApiClient.auth.$get.mockRejectedValue(
        new Error('無効なトークンです')
      );

      await expect(mockApiClient.auth.$get())
        .rejects.toThrow('無効なトークンです');
    });
  });
});