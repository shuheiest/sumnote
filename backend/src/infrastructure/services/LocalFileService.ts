import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileService, UploadedFile } from '@domain/services/FileService';

export const createLocalFileService = (uploadDir: string): FileService => ({
  saveFile: async (file: Express.Multer.File, directory: string): Promise<UploadedFile> => {
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, directory, filename);
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    return {
      filename,
      originalname: file.originalname,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype,
    };
  },

  deleteFile: async (filePath: string): Promise<boolean> => {
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  },

  getFileUrl: (filePath: string): string => {
    return `/files/${path.basename(filePath)}`;
  },

  validateFileType: (mimetype: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(mimetype);
  },

  validateFileSize: (size: number, maxSize: number): boolean => {
    return size <= maxSize;
  },
});