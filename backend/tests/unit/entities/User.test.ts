import { createUser, isAdmin, canEdit } from '../../../src/domain/entities/User';

describe('User Entity', () => {
  const mockUser = createUser(
    '1',
    'test@example.com',
    'Test User',
    'hashedPassword',
    'user'
  );

  const mockAdminUser = createUser(
    '2',
    'admin@example.com',
    'Admin User',
    'hashedPassword',
    'admin'
  );

  describe('createUser', () => {
    it('should create a user with correct properties', () => {
      expect(mockUser.id).toBe('1');
      expect(mockUser.email).toBe('test@example.com');
      expect(mockUser.name).toBe('Test User');
      expect(mockUser.password).toBe('hashedPassword');
      expect(mockUser.role).toBe('user');
      expect(mockUser.createdAt).toBeInstanceOf(Date);
      expect(mockUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user with default role when not specified', () => {
      const user = createUser('1', 'test@example.com', 'Test User', 'password');
      expect(user.role).toBe('user');
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      expect(isAdmin(mockAdminUser)).toBe(true);
    });

    it('should return false for regular user', () => {
      expect(isAdmin(mockUser)).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('should return true for admin user regardless of resource owner', () => {
      expect(canEdit(mockAdminUser, '999')).toBe(true);
    });

    it('should return true for user editing their own resource', () => {
      expect(canEdit(mockUser, '1')).toBe(true);
    });

    it('should return false for user editing others resource', () => {
      expect(canEdit(mockUser, '999')).toBe(false);
    });
  });
});