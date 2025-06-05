import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Comment as CommentIcon,
  Send,
  Delete,
  Edit,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import type { Document } from '../api/@types';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');

  const { comments, createComment, deleteComment, loading: commentsLoading } = useComments(id);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        const data = await apiClient.documents._id(id).$get();
        setDocument(data);
      } catch (err) {
        setError('ドキュメントの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

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

  if (!document) {
    return <Alert severity="error">ドキュメントが見つかりません</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/documents')}
        sx={{ mb: 2 }}
      >
        ドキュメント一覧に戻る
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {document.title}
        </Typography>

        {document.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {document.description}
          </Typography>
        )}

        <Box display="flex" gap={1} mb={2}>
          <Chip label={formatFileSize(document.fileSize)} variant="outlined" />
          <Chip label="PDF" color="primary" variant="outlined" />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          アップロード日: {new Date(document.createdAt).toLocaleDateString('ja-JP')}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          ファイル名: {document.fileName}
        </Typography>

        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<Download />}
            href={`/api/files/${document.fileName}`}
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

export default DocumentDetailPage;