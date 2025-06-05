import { PrismaClient } from '@prisma/client';
import type { CommentRepository } from '@domain/repositories/CommentRepository';
import type { Comment } from '@domain/entities/Comment';

export const createPrismaCommentRepository = (prisma: PrismaClient): CommentRepository => ({
  findById: async (id: string): Promise<Comment | null> => {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });
    return comment ? {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      documentId: comment.documentId || undefined,
      audioId: comment.audioId || undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    } : null;
  },

  findByDocumentId: async (documentId: string): Promise<Comment[]> => {
    const comments = await prisma.comment.findMany({
      where: { documentId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      documentId: comment.documentId || undefined,
      audioId: comment.audioId || undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  },

  findByAudioId: async (audioId: string): Promise<Comment[]> => {
    const comments = await prisma.comment.findMany({
      where: { audioId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      documentId: comment.documentId || undefined,
      audioId: comment.audioId || undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  },

  findByAuthorId: async (authorId: string): Promise<Comment[]> => {
    const comments = await prisma.comment.findMany({
      where: { authorId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      documentId: comment.documentId || undefined,
      audioId: comment.audioId || undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  },

  create: async (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> => {
    const comment = await prisma.comment.create({
      data: commentData,
    });
    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      documentId: comment.documentId || undefined,
      audioId: comment.audioId || undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  },

  update: async (id: string, commentData: Partial<Comment>): Promise<Comment | null> => {
    try {
      const comment = await prisma.comment.update({
        where: { id },
        data: commentData,
      });
      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        documentId: comment.documentId || undefined,
        audioId: comment.audioId || undefined,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await prisma.comment.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
});