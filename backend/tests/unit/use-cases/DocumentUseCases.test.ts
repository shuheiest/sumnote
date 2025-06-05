import { createDocumentUseCases } from '../../../src/application/use-cases/DocumentUseCases';
import type { DocumentRepository } from '../../../src/domain/repositories/DocumentRepository';
import type { FileService } from '../../../src/domain/services/FileService';
import { createDocument } from '../../../src/domain/entities/Document';
import { createUser } from '../../../src/domain/entities/User';

describe('DocumentUseCases', () => {
  let mockDocumentRepository: jest.Mocked<DocumentRepository>;
  let mockFileService: jest.Mocked<FileService>;
  let documentUseCases: ReturnType<typeof createDocumentUseCases>;

  beforeEach(() => {
    mockDocumentRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockFileService = {
      saveFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
      validateFileType: jest.fn(),
      validateFileSize: jest.fn(),
    };

    documentUseCases = createDocumentUseCases(mockDocumentRepository, mockFileService);
  });

  const mockFile = {
    buffer: Buffer.from('test'),
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
  } as Express.Multer.File;

  const mockDocument = createDocument(
    '1',
    'Test Document',
    'test.pdf',
    '/uploads/documents/test.pdf',
    1024,
    'application/pdf',
    'user1'
  );

  const mockUser = createUser('user1', 'test@example.com', 'Test User', 'password', 'user');
  const mockAdminUser = createUser('admin1', 'admin@example.com', 'Admin User', 'password', 'admin');

  describe('getAllDocuments', () => {
    it('should return all documents', async () => {
      const mockDocuments = [mockDocument];
      mockDocumentRepository.findAll.mockResolvedValue(mockDocuments);

      const result = await documentUseCases.getAllDocuments();

      expect(result).toEqual(mockDocuments);
      expect(mockDocumentRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      mockDocumentRepository.findById.mockResolvedValue(mockDocument);

      const result = await documentUseCases.getDocumentById('1');

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when document not found', async () => {
      mockDocumentRepository.findById.mockResolvedValue(null);

      const result = await documentUseCases.getDocumentById('999');

      expect(result).toBeNull();
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      mockFileService.validateFileType.mockReturnValue(true);
      mockFileService.validateFileSize.mockReturnValue(true);
      mockFileService.saveFile.mockResolvedValue({
        filename: 'uuid.pdf',
        originalname: 'test.pdf',
        path: '/uploads/documents/uuid.pdf',
        size: 1024,
        mimetype: 'application/pdf',
      });
      mockDocumentRepository.create.mockResolvedValue(mockDocument);

      const result = await documentUseCases.uploadDocument(
        mockFile,
        'Test Document',
        'user1',
        'Test description'
      );

      expect(result).toEqual(mockDocument);
      expect(mockFileService.validateFileType).toHaveBeenCalledWith('application/pdf', ['application/pdf']);
      expect(mockFileService.validateFileSize).toHaveBeenCalledWith(1024, 10 * 1024 * 1024);
      expect(mockFileService.saveFile).toHaveBeenCalledWith(mockFile, 'documents');
    });

    it('should throw error for invalid file type', async () => {
      mockFileService.validateFileType.mockReturnValue(false);

      await expect(documentUseCases.uploadDocument(
        { ...mockFile, mimetype: 'image/jpeg' },
        'Test Document',
        'user1'
      )).rejects.toThrow('PDFファイルのみアップロード可能です');
    });

    it('should throw error for file too large', async () => {
      mockFileService.validateFileType.mockReturnValue(true);
      mockFileService.validateFileSize.mockReturnValue(false);

      await expect(documentUseCases.uploadDocument(
        { ...mockFile, size: 20 * 1024 * 1024 },
        'Test Document',
        'user1'
      )).rejects.toThrow('ファイルサイズが大きすぎます（最大10MB）');
    });
  });

  describe('updateDocument', () => {
    it('should update document when user is owner', async () => {
      mockDocumentRepository.findById.mockResolvedValue(mockDocument);
      const updatedDocument = { ...mockDocument, title: 'Updated Title' };
      mockDocumentRepository.update.mockResolvedValue(updatedDocument);

      const result = await documentUseCases.updateDocument(
        '1',
        { title: 'Updated Title' },
        mockUser
      );

      expect(result).toEqual(updatedDocument);
      expect(mockDocumentRepository.update).toHaveBeenCalledWith('1', { title: 'Updated Title' });
    });

    it('should update document when user is admin', async () => {
      const otherUserDocument = { ...mockDocument, uploadedBy: 'user2' };
      mockDocumentRepository.findById.mockResolvedValue(otherUserDocument);
      const updatedDocument = { ...otherUserDocument, title: 'Updated Title' };
      mockDocumentRepository.update.mockResolvedValue(updatedDocument);

      const result = await documentUseCases.updateDocument(
        '1',
        { title: 'Updated Title' },
        mockAdminUser
      );

      expect(result).toEqual(updatedDocument);
    });

    it('should throw error when user cannot edit document', async () => {
      const otherUserDocument = { ...mockDocument, uploadedBy: 'user2' };
      mockDocumentRepository.findById.mockResolvedValue(otherUserDocument);

      await expect(documentUseCases.updateDocument(
        '1',
        { title: 'Updated Title' },
        mockUser
      )).rejects.toThrow('このドキュメントを編集する権限がありません');
    });

    it('should throw error when document not found', async () => {
      mockDocumentRepository.findById.mockResolvedValue(null);

      await expect(documentUseCases.updateDocument(
        '999',
        { title: 'Updated Title' },
        mockUser
      )).rejects.toThrow('ドキュメントが見つかりません');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document when user is owner', async () => {
      mockDocumentRepository.findById.mockResolvedValue(mockDocument);
      mockFileService.deleteFile.mockResolvedValue(true);
      mockDocumentRepository.delete.mockResolvedValue(true);

      await documentUseCases.deleteDocument('1', mockUser);

      expect(mockFileService.deleteFile).toHaveBeenCalledWith('/uploads/documents/test.pdf');
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when user cannot delete document', async () => {
      const otherUserDocument = { ...mockDocument, uploadedBy: 'user2' };
      mockDocumentRepository.findById.mockResolvedValue(otherUserDocument);

      await expect(documentUseCases.deleteDocument('1', mockUser))
        .rejects.toThrow('このドキュメントを削除する権限がありません');
    });

    it('should throw error when document not found', async () => {
      mockDocumentRepository.findById.mockResolvedValue(null);

      await expect(documentUseCases.deleteDocument('999', mockUser))
        .rejects.toThrow('ドキュメントが見つかりません');
    });
  });
});