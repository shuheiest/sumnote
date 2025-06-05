export interface UploadedFile {
  readonly filename: string;
  readonly originalname: string;
  readonly path: string;
  readonly size: number;
  readonly mimetype: string;
}

export interface FileService {
  saveFile: (file: Express.Multer.File, directory: string) => Promise<UploadedFile>;
  deleteFile: (filePath: string) => Promise<boolean>;
  getFileUrl: (filePath: string) => string;
  validateFileType: (mimetype: string, allowedTypes: string[]) => boolean;
  validateFileSize: (size: number, maxSize: number) => boolean;
}

export const createFileService = (dependencies: {
  saveFile: (file: Express.Multer.File, directory: string) => Promise<UploadedFile>;
  deleteFile: (filePath: string) => Promise<boolean>;
  getFileUrl: (filePath: string) => string;
  validateFileType: (mimetype: string, allowedTypes: string[]) => boolean;
  validateFileSize: (size: number, maxSize: number) => boolean;
}): FileService => dependencies;