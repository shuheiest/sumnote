import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  PlayArrow,
  Pause,
  AudioFile,
} from '@mui/icons-material';
import { useAudios } from '../hooks/useAudios';
import { useContentFilters } from '../hooks/useContentFilters';
import { AudioUploadForm } from '../components/AudioUploadForm';
import { ContentFilters } from '../components/ContentFilters';
import { ContentGridSkeleton, EmptyState } from '../components/SkeletonLoaders';
import { AudioUploadFormData } from '../schemas/validation';

const SimpleAudiosPage: React.FC = () => {
  const { audios, loading, uploadAudio, deleteAudio } = useAudios();
  const { filters, setFilters, filteredItems, totalCount, filteredCount } = useContentFilters(audios);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleUpload = async (data: AudioUploadFormData) => {
    setUploading(true);
    setUploadError('');
    try {
      await uploadAudio(data.file, data.title, data.description || '');
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました';
      setUploadError(errorMessage);
      throw error; // フォームコンポーネントでエラーハンドリングするために再throw
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setUploadError('');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAudio(id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handlePlay = async (audio: any) => {
    if (playingId === audio.id) {
      setPlayingId(null);
      // 現在再生中の音声を停止
      const currentAudio = document.querySelector('audio[data-audio-id="' + audio.id + '"]') as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.remove();
      }
    } else {
      setPlayingId(audio.id);
      try {
        // サーバーから提供される音声ファイルのURLで再生
        const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/files/${audio.filePath}`;
        
        const audioElement = new Audio();
        audioElement.setAttribute('data-audio-id', audio.id);
        audioElement.crossOrigin = 'anonymous'; // CORS対応
        audioElement.preload = 'auto';
        
        // エラーハンドリング
        audioElement.onerror = (e) => {
          console.error('Audio playback error:', audioElement.error);
          setPlayingId(null);
          alert(`音声ファイルの再生に失敗しました: ${audioElement.error?.message || 'Unknown error'}`);
        };
        
        
        // 再生終了時の処理
        audioElement.onended = () => {
          setPlayingId(null);
          audioElement.remove();
        };
        
        // DOMに追加（再生前に追加）
        document.body.appendChild(audioElement);
        
        // ソースを設定
        audioElement.src = fileUrl;
        
        // 再生開始
        try {
          await audioElement.play();
        } catch (playError) {
          setPlayingId(null);
          audioElement.remove();
          alert(`再生エラー: ${playError.message}`);
        }
        
      } catch (error) {
        setPlayingId(null);
        alert(`音声ファイルの再生に失敗しました: ${error.message}`);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          音声ファイル
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          音声ファイル追加
        </Button>
      </Box>

      {/* フィルター */}
      <ContentFilters
        filters={filters}
        onFiltersChange={setFilters}
        contentType="audios"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* コンテンツグリッド */}
      {loading ? (
        <ContentGridSkeleton count={6} />
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={3}>
          {filteredItems.map((audio) => (
            <Grid item xs={12} sm={6} md={4} key={audio.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AudioFile color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3" noWrap>
                      {audio.title}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {audio.description || 'No description'}
                  </Typography>
                  
                  <Chip
                    label={new Date(audio.createdAt).toLocaleDateString('ja-JP')}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                
                <Box display="flex" justifyContent="space-between" px={2} pb={2}>
                  <IconButton 
                    onClick={() => handlePlay(audio)} 
                    color="primary"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {playingId === audio.id ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(audio.id)}
                    color="error"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : totalCount === 0 ? (
        <EmptyState
          title="音声ファイルがありません"
          description="最初の音声ファイルをアップロードしてください"
          actionLabel="音声ファイルを追加"
          onAction={() => setOpen(true)}
        />
      ) : (
        <EmptyState
          title="検索結果が見つかりません"
          description="検索条件を変更してみてください"
          actionLabel="フィルターをクリア"
          onAction={() => setFilters({
            searchTerm: '',
            sortBy: 'newest',
            sortOrder: 'desc',
            filterType: 'all',
          })}
        />
      )}

      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>音声ファイルアップロード</DialogTitle>
        <AudioUploadForm
          onSubmit={handleUpload}
          onCancel={handleCancel}
          loading={uploading}
          error={uploadError}
        />
      </Dialog>
    </Box>
  );
};

export default SimpleAudiosPage;