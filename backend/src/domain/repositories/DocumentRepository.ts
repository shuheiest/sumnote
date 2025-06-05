import { Document } from '../entities/Document';

export interface DocumentRepository {
  findById: (id: string) => Promise<Document | null>;
  findAll: () => Promise<Document[]>;
  findByUserId: (userId: string) => Promise<Document[]>;
  create: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Document>;
  update: (id: string, document: Partial<Document>) => Promise<Document | null>;
  delete: (id: string) => Promise<boolean>;
}