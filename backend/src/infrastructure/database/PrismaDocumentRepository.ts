import { PrismaClient } from '@prisma/client';
import type { DocumentRepository } from '@domain/repositories/DocumentRepository';
import type { Document } from '@domain/entities/Document';

export const createPrismaDocumentRepository = (prisma: PrismaClient): DocumentRepository => ({
  findById: async (id: string): Promise<Document | null> => {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true, comments: { include: { author: true } } },
    });
    return document ? {
      id: document.id,
      title: document.title,
      description: document.description || undefined,
      fileName: document.fileName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    } : null;
  },

  findAll: async (): Promise<Document[]> => {
    const documents = await prisma.document.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return documents.map(document => ({
      id: document.id,
      title: document.title,
      description: document.description || undefined,
      fileName: document.fileName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }));
  },

  findByUserId: async (userId: string): Promise<Document[]> => {
    const documents = await prisma.document.findMany({
      where: { uploadedBy: userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return documents.map(document => ({
      id: document.id,
      title: document.title,
      description: document.description || undefined,
      fileName: document.fileName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }));
  },

  create: async (documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
    const document = await prisma.document.create({
      data: documentData,
    });
    return {
      id: document.id,
      title: document.title,
      description: document.description || undefined,
      fileName: document.fileName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  },

  update: async (id: string, documentData: Partial<Document>): Promise<Document | null> => {
    try {
      const document = await prisma.document.update({
        where: { id },
        data: documentData,
      });
      return {
        id: document.id,
        title: document.title,
        description: document.description || undefined,
        fileName: document.fileName,
        filePath: document.filePath,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        uploadedBy: document.uploadedBy,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await prisma.document.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
});