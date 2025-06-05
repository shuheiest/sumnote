import { createAuthUseCases } from '../../../src/application/use-cases/AuthUseCases';
import type { UserRepository } from '../../../src/domain/repositories/UserRepository';
import type { AuthService } from '../../../src/domain/services/AuthService';
import { createUser } from '../../../src/domain/entities/User';

describe('AuthUseCases', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthService: jest.Mocked<AuthService>;
  let authUseCases: ReturnType<typeof createAuthUseCases>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockAuthService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    authUseCases = createAuthUseCases(mockUserRepository, mockAuthService);
  });

  describe('login', () => {
    const mockUser = createUser(
      '1',
      'test@example.com',
      'Test User',
      'hashedPassword',
      'user'
    );

    it('should login successfully with valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.comparePassword.mockResolvedValue(true);
      mockAuthService.generateToken.mockResolvedValue('token123');

      const result = await authUseCases.login('test@example.com', 'password');

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('token123');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(mockAuthService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authUseCases.login('test@example.com', 'password'))
        .rejects.toThrow('ユーザーが見つかりません');
    });

    it('should throw error when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.comparePassword.mockResolvedValue(false);

      await expect(authUseCases.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('パスワードが間違っています');
    });
  });

  describe('register', () => {
    const newUser = createUser(
      '1',
      'new@example.com',
      'New User',
      'hashedPassword',
      'user'
    );

    it('should register new user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(newUser);
      mockAuthService.generateToken.mockResolvedValue('token123');

      const result = await authUseCases.register('new@example.com', 'New User', 'password');

      expect(result.user).toEqual(newUser);
      expect(result.token).toBe('token123');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith('password');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedPassword',
        role: 'user',
      });
    });

    it('should throw error when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(newUser);

      await expect(authUseCases.register('new@example.com', 'New User', 'password'))
        .rejects.toThrow('このメールアドレスは既に使用されています');
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = createUser(
      '1',
      'test@example.com',
      'Test User',
      'hashedPassword',
      'user'
    );

    it('should return user when token is valid', async () => {
      const tokenPayload = createUser('1', 'test@example.com', '', '', 'user');
      mockAuthService.verifyToken.mockResolvedValue(tokenPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authUseCases.getCurrentUser('validtoken');

      expect(result).toEqual(mockUser);
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('validtoken');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when token is invalid', async () => {
      mockAuthService.verifyToken.mockResolvedValue(null);

      const result = await authUseCases.getCurrentUser('invalidtoken');

      expect(result).toBeNull();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
});