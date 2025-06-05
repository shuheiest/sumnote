import { createDocument, isPdfDocument, updateDocument } from '../../../src/domain/entities/Document';

describe('Document Entity', () => {
  const mockDocument = createDocument(
    '1',
    'Test Document',
    'test.pdf',
    '/uploads/documents/test.pdf',
    1024,
    'application/pdf',
    'user1',
    'Test description'
  );

  describe('createDocument', () => {
    it('should create a document with correct properties', () => {
      expect(mockDocument.id).toBe('1');
      expect(mockDocument.title).toBe('Test Document');
      expect(mockDocument.fileName).toBe('test.pdf');
      expect(mockDocument.filePath).toBe('/uploads/documents/test.pdf');
      expect(mockDocument.fileSize).toBe(1024);
      expect(mockDocument.mimeType).toBe('application/pdf');
      expect(mockDocument.uploadedBy).toBe('user1');
      expect(mockDocument.description).toBe('Test description');
      expect(mockDocument.createdAt).toBeInstanceOf(Date);
      expect(mockDocument.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a document without description', () => {
      const doc = createDocument(
        '2',
        'Test Document 2',
        'test2.pdf',
        '/uploads/documents/test2.pdf',
        2048,
        'application/pdf',
        'user1'
      );
      expect(doc.description).toBeUndefined();
    });
  });

  describe('isPdfDocument', () => {
    it('should return true for PDF document', () => {
      expect(isPdfDocument(mockDocument)).toBe(true);
    });

    it('should return false for non-PDF document', () => {
      const nonPdfDoc = createDocument(
        '3',
        'Test Image',
        'test.jpg',
        '/uploads/documents/test.jpg',
        1024,
        'image/jpeg',
        'user1'
      );
      expect(isPdfDocument(nonPdfDoc)).toBe(false);
    });
  });

  describe('updateDocument', () => {
    it('should update document title and description', () => {
      const updatedDoc = updateDocument(mockDocument, {
        title: 'Updated Title',
        description: 'Updated description',
      });

      expect(updatedDoc.title).toBe('Updated Title');
      expect(updatedDoc.description).toBe('Updated description');
      expect(updatedDoc.updatedAt).not.toEqual(mockDocument.updatedAt);
      expect(updatedDoc.id).toBe(mockDocument.id);
      expect(updatedDoc.fileName).toBe(mockDocument.fileName);
    });

    it('should update only title when description is not provided', () => {
      const updatedDoc = updateDocument(mockDocument, {
        title: 'New Title Only',
      });

      expect(updatedDoc.title).toBe('New Title Only');
      expect(updatedDoc.description).toBe(mockDocument.description);
    });
  });
});