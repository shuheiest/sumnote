import type { AudioRepository } from '@domain/repositories/AudioRepository';
import type { FileService } from '@domain/services/FileService';
import type { Audio } from '@domain/entities/Audio';
import { createAudio } from '@domain/entities/Audio';
import { canEdit } from '@domain/entities/User';
import type { User } from '@domain/entities/User';

export type AudioUseCases = {
  getAllAudios: () => Promise<Audio[]>;
  getAudioById: (id: string) => Promise<Audio | null>;
  uploadAudio: (file: Express.Multer.File, title: string, uploadedBy: string, description?: string) => Promise<Audio>;
  updateAudio: (id: string, updates: { title?: string; description?: string }, user: User) => Promise<Audio>;
  deleteAudio: (id: string, user: User) => Promise<void>;
};

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const createAudioUseCases = (
  audioRepository: AudioRepository,
  fileService: FileService
): AudioUseCases => ({
  getAllAudios: async (): Promise<Audio[]> => {
    return audioRepository.findAll();
  },

  getAudioById: async (id: string): Promise<Audio | null> => {
    return audioRepository.findById(id);
  },

  uploadAudio: async (
    file: Express.Multer.File,
    title: string,
    uploadedBy: string,
    description?: string
  ): Promise<Audio> => {
    if (!fileService.validateFileType(file.mimetype, ALLOWED_AUDIO_TYPES)) {
      throw new Error('MP3ファイルのみアップロード可能です');
    }

    if (!fileService.validateFileSize(file.size, MAX_FILE_SIZE)) {
      throw new Error('ファイルサイズが大きすぎます（最大50MB）');
    }

    const uploadedFile = await fileService.saveFile(file, 'audio');

    const audioData = {
      title,
      description,
      fileName: uploadedFile.originalname,
      filePath: uploadedFile.path,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      uploadedBy,
    };

    return audioRepository.create(audioData);
  },

  updateAudio: async (
    id: string,
    updates: { title?: string; description?: string },
    user: User
  ): Promise<Audio> => {
    const audio = await audioRepository.findById(id);
    if (!audio) {
      throw new Error('音声ファイルが見つかりません');
    }

    if (!canEdit(user, audio.uploadedBy)) {
      throw new Error('この音声ファイルを編集する権限がありません');
    }

    const updatedAudio = await audioRepository.update(id, updates);
    if (!updatedAudio) {
      throw new Error('音声ファイルの更新に失敗しました');
    }

    return updatedAudio;
  },

  deleteAudio: async (id: string, user: User): Promise<void> => {
    const audio = await audioRepository.findById(id);
    if (!audio) {
      throw new Error('音声ファイルが見つかりません');
    }

    if (!canEdit(user, audio.uploadedBy)) {
      throw new Error('この音声ファイルを削除する権限がありません');
    }

    await fileService.deleteFile(audio.filePath);
    const deleted = await audioRepository.delete(id);
    if (!deleted) {
      throw new Error('音声ファイルの削除に失敗しました');
    }
  },
});