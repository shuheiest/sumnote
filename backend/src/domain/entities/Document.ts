export interface Document {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly uploadedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const createDocument = (
  id: string,
  title: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  uploadedBy: string,
  description?: string,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): Document => ({
  id,
  title,
  description,
  fileName,
  filePath,
  fileSize,
  mimeType,
  uploadedBy,
  createdAt,
  updatedAt,
});

export const isPdfDocument = (document: Document): boolean =>
  document.mimeType === 'application/pdf';

export const updateDocument = (
  document: Document,
  updates: Partial<Pick<Document, 'title' | 'description'>>
): Document => ({
  ...document,
  ...updates,
  updatedAt: new Date(),
});