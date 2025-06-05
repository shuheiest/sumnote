export interface Comment {
  readonly id: string;
  readonly content: string;
  readonly authorId: string;
  readonly documentId?: string;
  readonly audioId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const createComment = (
  id: string,
  content: string,
  authorId: string,
  documentId?: string,
  audioId?: string,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): Comment => ({
  id,
  content,
  authorId,
  documentId,
  audioId,
  createdAt,
  updatedAt,
});

export const isDocumentComment = (comment: Comment): boolean =>
  comment.documentId !== undefined;

export const isAudioComment = (comment: Comment): boolean =>
  comment.audioId !== undefined;

export const updateComment = (
  comment: Comment,
  content: string
): Comment => ({
  ...comment,
  content,
  updatedAt: new Date(),
});