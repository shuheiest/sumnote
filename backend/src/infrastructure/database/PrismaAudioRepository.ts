import { PrismaClient } from '@prisma/client';
import type { AudioRepository } from '@domain/repositories/AudioRepository';
import type { Audio } from '@domain/entities/Audio';

export const createPrismaAudioRepository = (prisma: PrismaClient): AudioRepository => ({
  findById: async (id: string): Promise<Audio | null> => {
    const audio = await prisma.audio.findUnique({
      where: { id },
      include: { user: true, comments: { include: { author: true } } },
    });
    return audio ? {
      id: audio.id,
      title: audio.title,
      description: audio.description || undefined,
      fileName: audio.fileName,
      filePath: audio.filePath,
      fileSize: audio.fileSize,
      duration: audio.duration || undefined,
      mimeType: audio.mimeType,
      uploadedBy: audio.uploadedBy,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    } : null;
  },

  findAll: async (): Promise<Audio[]> => {
    const audios = await prisma.audio.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return audios.map(audio => ({
      id: audio.id,
      title: audio.title,
      description: audio.description || undefined,
      fileName: audio.fileName,
      filePath: audio.filePath,
      fileSize: audio.fileSize,
      duration: audio.duration || undefined,
      mimeType: audio.mimeType,
      uploadedBy: audio.uploadedBy,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    }));
  },

  findByUserId: async (userId: string): Promise<Audio[]> => {
    const audios = await prisma.audio.findMany({
      where: { uploadedBy: userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return audios.map(audio => ({
      id: audio.id,
      title: audio.title,
      description: audio.description || undefined,
      fileName: audio.fileName,
      filePath: audio.filePath,
      fileSize: audio.fileSize,
      duration: audio.duration || undefined,
      mimeType: audio.mimeType,
      uploadedBy: audio.uploadedBy,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    }));
  },

  create: async (audioData: Omit<Audio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audio> => {
    const audio = await prisma.audio.create({
      data: audioData,
    });
    return {
      id: audio.id,
      title: audio.title,
      description: audio.description || undefined,
      fileName: audio.fileName,
      filePath: audio.filePath,
      fileSize: audio.fileSize,
      duration: audio.duration || undefined,
      mimeType: audio.mimeType,
      uploadedBy: audio.uploadedBy,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    };
  },

  update: async (id: string, audioData: Partial<Audio>): Promise<Audio | null> => {
    try {
      const audio = await prisma.audio.update({
        where: { id },
        data: audioData,
      });
      return {
        id: audio.id,
        title: audio.title,
        description: audio.description || undefined,
        fileName: audio.fileName,
        filePath: audio.filePath,
        fileSize: audio.fileSize,
        duration: audio.duration || undefined,
        mimeType: audio.mimeType,
        uploadedBy: audio.uploadedBy,
        createdAt: audio.createdAt,
        updatedAt: audio.updatedAt,
      };
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await prisma.audio.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
});