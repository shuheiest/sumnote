import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  CloudUpload,
  Delete,
  PlayArrow,
  Pause,
  GetApp,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAudios } from '../hooks/useAudios';

const SimpleAudiosPage: React.FC = () => {
  const { audios, loading, uploadAudio, deleteAudio } = useAudios();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
      }
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setUploading(true);
    try {
      await uploadAudio(selectedFile, title, description);
      setOpen(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
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

      <Grid container spacing={3}>
        {audios.map((audio) => (
          <Grid item xs={12} sm={6} md={4} key={audio.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {audio.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {audio.description}
                </Typography>
                <Chip
                  label={new Date(audio.createdAt).toLocaleDateString('ja-JP')}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" justifyContent="space-between">
                  <IconButton onClick={() => handlePlay(audio)} color="primary">
                    {playingId === audio.id ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(audio.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {audios.length === 0 && !loading && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  音声ファイルがありません
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setOpen(true)}
                  sx={{ mt: 2 }}
                >
                  最初の音声ファイルを追加
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>音声ファイルアップロード</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              mb: 2,
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'transparent',
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {selectedFile
                ? `選択済み: ${selectedFile.name}`
                : '音声ファイルをドラッグ&ドロップまたはクリック'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              *.mp3, *.wav, *.ogg ファイル対応
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="説明（任意）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || !title.trim() || uploading}
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleAudiosPage;