export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type Document = {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Audio = {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  content: string;
  authorId: string;
  documentId?: string;
  audioId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommentRequest = {
  content: string;
  documentId?: string;
  audioId?: string;
};