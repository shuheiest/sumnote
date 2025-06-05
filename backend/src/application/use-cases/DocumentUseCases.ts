import type { DocumentRepository } from '@domain/repositories/DocumentRepository';
import type { FileService } from '@domain/services/FileService';
import type { Document } from '@domain/entities/Document';
import { createDocument } from '@domain/entities/Document';
import { canEdit } from '@domain/entities/User';
import type { User } from '@domain/entities/User';

export type DocumentUseCases = {
  getAllDocuments: () => Promise<Document[]>;
  getDocumentById: (id: string) => Promise<Document | null>;
  uploadDocument: (file: Express.Multer.File, title: string, uploadedBy: string, description?: string) => Promise<Document>;
  updateDocument: (id: string, updates: { title?: string; description?: string }, user: User) => Promise<Document>;
  deleteDocument: (id: string, user: User) => Promise<void>;
};

const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const createDocumentUseCases = (
  documentRepository: DocumentRepository,
  fileService: FileService
): DocumentUseCases => ({
  getAllDocuments: async (): Promise<Document[]> => {
    return documentRepository.findAll();
  },

  getDocumentById: async (id: string): Promise<Document | null> => {
    return documentRepository.findById(id);
  },

  uploadDocument: async (
    file: Express.Multer.File,
    title: string,
    uploadedBy: string,
    description?: string
  ): Promise<Document> => {
    if (!fileService.validateFileType(file.mimetype, ALLOWED_DOCUMENT_TYPES)) {
      throw new Error('PDFファイルのみアップロード可能です');
    }

    if (!fileService.validateFileSize(file.size, MAX_FILE_SIZE)) {
      throw new Error('ファイルサイズが大きすぎます（最大10MB）');
    }

    const uploadedFile = await fileService.saveFile(file, 'documents');

    const documentData = {
      title,
      description,
      fileName: uploadedFile.originalname,
      filePath: uploadedFile.path,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      uploadedBy,
    };

    return documentRepository.create(documentData);
  },

  updateDocument: async (
    id: string,
    updates: { title?: string; description?: string },
    user: User
  ): Promise<Document> => {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new Error('ドキュメントが見つかりません');
    }

    if (!canEdit(user, document.uploadedBy)) {
      throw new Error('このドキュメントを編集する権限がありません');
    }

    const updatedDocument = await documentRepository.update(id, updates);
    if (!updatedDocument) {
      throw new Error('ドキュメントの更新に失敗しました');
    }

    return updatedDocument;
  },

  deleteDocument: async (id: string, user: User): Promise<void> => {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new Error('ドキュメントが見つかりません');
    }

    if (!canEdit(user, document.uploadedBy)) {
      throw new Error('このドキュメントを削除する権限がありません');
    }

    await fileService.deleteFile(document.filePath);
    const deleted = await documentRepository.delete(id);
    if (!deleted) {
      throw new Error('ドキュメントの削除に失敗しました');
    }
  },
});