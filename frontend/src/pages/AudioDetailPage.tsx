import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Download,
  Comment as CommentIcon,
  Send,
  Delete,
  VolumeUp,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import type { Audio } from '../api/@types';

const AudioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [audio, setAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { comments, createComment, deleteComment, loading: commentsLoading } = useComments(undefined, id);

  useEffect(() => {
    const fetchAudio = async () => {
      if (!id) return;
      
      try {
        const data = await apiClient.audios._id(id).$get();
        setAudio(data);
      } catch (err) {
        setError('音声ファイルの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [id]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audio]);

  const togglePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'コメントの投稿に失敗しました');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('このコメントを削除しますか？')) {
      try {
        await deleteComment(commentId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'コメントの削除に失敗しました');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canEditComment = (comment: any): boolean => {
    return user?.role === 'admin' || comment.authorId === user?.id;
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!audio) {
    return <Alert severity="error">音声ファイルが見つかりません</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/audios')}
        sx={{ mb: 2 }}
      >
        音声ファイル一覧に戻る
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {audio.title}
        </Typography>

        {audio.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {audio.description}
          </Typography>
        )}

        <Box display="flex" gap={1} mb={3}>
          <Chip label={formatFileSize(audio.fileSize)} variant="outlined" />
          <Chip label="MP3" color="primary" variant="outlined" />
          {audio.duration && (
            <Chip label={formatTime(audio.duration)} variant="outlined" />
          )}
        </Box>

        {/* Audio Player */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <VolumeUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">音声プレイヤー</Typography>
            </Box>
            
            <audio
              ref={audioRef}
              src={`/api/files/${audio.fileName}`}
              preload="metadata"
            />

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <IconButton
                onClick={togglePlayPause}
                color="primary"
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {formatTime(currentTime)}
              </Typography>
              
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={handleProgressClick}
              >
                <LinearProgress
                  variant="determinate"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          アップロード日: {new Date(audio.createdAt).toLocaleDateString('ja-JP')}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          ファイル名: {audio.fileName}
        </Typography>

        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<Download />}
            href={`/api/files/${audio.fileName}`}
            target="_blank"
          >
            ダウンロード
          </Button>
        </Box>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            コメント ({comments.length})
          </Typography>

          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="コメントを入力してください..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={!newComment.trim()}
            >
              コメントを投稿
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {commentsLoading ? (
            <Typography>コメントを読み込み中...</Typography>
          ) : comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              まだコメントがありません
            </Typography>
          ) : (
            <List>
              {comments.map((comment, index) => (
                <React.Fragment key={comment.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {comment.author?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString('ja-JP')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {comment.content}
                        </Typography>
                      }
                    />
                    {canEditComment(comment) && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteComment(comment.id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  {index < comments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AudioDetailPage;