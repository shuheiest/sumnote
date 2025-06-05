export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly password: string;
  readonly role: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const createUser = (
  id: string,
  email: string,
  name: string,
  password: string,
  role: string = 'user',
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): User => ({
  id,
  email,
  name,
  password,
  role,
  createdAt,
  updatedAt,
});

export const isAdmin = (user: User): boolean => user.role === 'admin';

export const canEdit = (user: User, resourceUserId: string): boolean =>
  isAdmin(user) || user.id === resourceUserId;