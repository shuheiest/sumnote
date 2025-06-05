import { useState, useEffect } from 'react';
import { apiClient } from '@services/api';

export const useAudios = () => {
  const [audios, setAudios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudios = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await apiClient.audios.$get();
      setAudios(data);
      setError(null);
    } catch (err) {
      setError('音声ファイルの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudios();
  }, []);

  const uploadAudio = async (file: File, title: string, description?: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) formData.append('description', description);

      await apiClient.audios.$post({ body: formData });
      await fetchAudios();
    } catch (err) {
      throw new Error('音声ファイルのアップロードに失敗しました');
    }
  };

  const deleteAudio = async (id: string): Promise<void> => {
    try {
      await apiClient.audios._id(id).$delete();
      await fetchAudios();
    } catch (err) {
      throw new Error('音声ファイルの削除に失敗しました');
    }
  };

  const updateAudio = async (id: string, updates: { title?: string; description?: string }): Promise<void> => {
    try {
      await apiClient.audios._id(id).$put({ body: updates });
      await fetchAudios();
    } catch (err) {
      throw new Error('音声ファイルの更新に失敗しました');
    }
  };

  return {
    audios,
    loading,
    error,
    uploadAudio,
    deleteAudio,
    updateAudio,
    refetch: fetchAudios,
  };
};