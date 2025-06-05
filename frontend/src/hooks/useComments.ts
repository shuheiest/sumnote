import { useState, useEffect } from 'react';
import { apiClient } from '@services/api';
import type { Comment, CreateCommentRequest } from '../api/@types';

export const useComments = (documentId?: string, audioId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (): Promise<void> => {
    try {
      setLoading(true);
      const query: { documentId?: string; audioId?: string } = {};
      if (documentId) query.documentId = documentId;
      if (audioId) query.audioId = audioId;
      
      const data = await apiClient.comments.$get({ query });
      setComments(data);
      setError(null);
    } catch (err) {
      setError('コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId || audioId) {
      fetchComments();
    }
  }, [documentId, audioId]);

  const createComment = async (content: string): Promise<void> => {
    try {
      const request: CreateCommentRequest = {
        content,
        documentId,
        audioId,
      };
      await apiClient.comments.$post({ body: request });
      await fetchComments();
    } catch (err) {
      throw new Error('コメントの作成に失敗しました');
    }
  };

  const updateComment = async (id: string, content: string): Promise<void> => {
    try {
      await apiClient.comments._id(id).$put({ body: { content } });
      await fetchComments();
    } catch (err) {
      throw new Error('コメントの更新に失敗しました');
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    try {
      await apiClient.comments._id(id).$delete();
      await fetchComments();
    } catch (err) {
      throw new Error('コメントの削除に失敗しました');
    }
  };

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
};