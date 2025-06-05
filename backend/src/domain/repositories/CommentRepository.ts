import { Comment } from '../entities/Comment';

export interface CommentRepository {
  findById: (id: string) => Promise<Comment | null>;
  findByDocumentId: (documentId: string) => Promise<Comment[]>;
  findByAudioId: (audioId: string) => Promise<Comment[]>;
  findByAuthorId: (authorId: string) => Promise<Comment[]>;
  create: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Comment>;
  update: (id: string, comment: Partial<Comment>) => Promise<Comment | null>;
  delete: (id: string) => Promise<boolean>;
}