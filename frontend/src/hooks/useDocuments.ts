import { useState, useEffect } from 'react';
import { apiClient } from '@services/api';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await apiClient.documents.$get();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError('ドキュメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadDocument = async (file: File, title: string, description?: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) formData.append('description', description);

      await apiClient.documents.$post({ body: formData });
      await fetchDocuments();
    } catch (err) {
      throw new Error('ドキュメントのアップロードに失敗しました');
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      await apiClient.documents._id(id).$delete();
      await fetchDocuments();
    } catch (err) {
      throw new Error('ドキュメントの削除に失敗しました');
    }
  };

  const updateDocument = async (id: string, updates: { title?: string; description?: string }): Promise<void> => {
    try {
      await apiClient.documents._id(id).$put({ body: updates });
      await fetchDocuments();
    } catch (err) {
      throw new Error('ドキュメントの更新に失敗しました');
    }
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    updateDocument,
    refetch: fetchDocuments,
  };
};