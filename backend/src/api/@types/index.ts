export type User = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type Document = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly uploadedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user?: User;
  readonly comments?: Comment[];
};

export type Audio = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileSize: number;
  readonly duration?: number;
  readonly mimeType: string;
  readonly uploadedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user?: User;
  readonly comments?: Comment[];
};

export type Comment = {
  readonly id: string;
  readonly content: string;
  readonly authorId: string;
  readonly documentId?: string;
  readonly audioId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly author?: User;
};

export type AuthResponse = {
  readonly user: User;
  readonly token: string;
};

export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

export type RegisterRequest = {
  readonly email: string;
  readonly name: string;
  readonly password: string;
};

export type CreateCommentRequest = {
  readonly content: string;
  readonly documentId?: string;
  readonly audioId?: string;
};

export type UploadResponse = {
  readonly id: string;
  readonly url: string;
  readonly message: string;
};

export type ErrorResponse = {
  readonly message: string;
  readonly statusCode: number;
};