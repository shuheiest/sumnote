import type { CommentRepository } from '@domain/repositories/CommentRepository';
import type { Comment } from '@domain/entities/Comment';
import { createComment } from '@domain/entities/Comment';
import { canEdit } from '@domain/entities/User';
import type { User } from '@domain/entities/User';

export type CommentUseCases = {
  getCommentsByDocumentId: (documentId: string) => Promise<Comment[]>;
  getCommentsByAudioId: (audioId: string) => Promise<Comment[]>;
  createComment: (content: string, authorId: string, documentId?: string, audioId?: string) => Promise<Comment>;
  updateComment: (id: string, content: string, user: User) => Promise<Comment>;
  deleteComment: (id: string, user: User) => Promise<void>;
};

export const createCommentUseCases = (
  commentRepository: CommentRepository
): CommentUseCases => ({
  getCommentsByDocumentId: async (documentId: string): Promise<Comment[]> => {
    return commentRepository.findByDocumentId(documentId);
  },

  getCommentsByAudioId: async (audioId: string): Promise<Comment[]> => {
    return commentRepository.findByAudioId(audioId);
  },

  createComment: async (
    content: string,
    authorId: string,
    documentId?: string,
    audioId?: string
  ): Promise<Comment> => {
    if (!documentId && !audioId) {
      throw new Error('ドキュメントIDまたは音声IDが必要です');
    }

    if (documentId && audioId) {
      throw new Error('ドキュメントIDと音声IDを同時に指定することはできません');
    }

    const commentData = {
      content,
      authorId,
      documentId,
      audioId,
    };

    return commentRepository.create(commentData);
  },

  updateComment: async (id: string, content: string, user: User): Promise<Comment> => {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new Error('コメントが見つかりません');
    }

    if (!canEdit(user, comment.authorId)) {
      throw new Error('このコメントを編集する権限がありません');
    }

    const updatedComment = await commentRepository.update(id, { content });
    if (!updatedComment) {
      throw new Error('コメントの更新に失敗しました');
    }

    return updatedComment;
  },

  deleteComment: async (id: string, user: User): Promise<void> => {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new Error('コメントが見つかりません');
    }

    if (!canEdit(user, comment.authorId)) {
      throw new Error('このコメントを削除する権限がありません');
    }

    const deleted = await commentRepository.delete(id);
    if (!deleted) {
      throw new Error('コメントの削除に失敗しました');
    }
  },
});