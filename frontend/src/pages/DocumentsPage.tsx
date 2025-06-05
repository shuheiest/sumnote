import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Description,
  Download,
  Delete,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';

const DocumentsPage: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const { documents, uploadDocument, deleteDocument, loading } = useDocuments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: () => {
      setError('PDFファイルのみアップロード可能です');
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError('ファイルとタイトルは必須です');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await uploadDocument(selectedFile, title.trim(), description.trim() || undefined);
      setUploadOpen(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('このドキュメントを削除しますか？')) {
      try {
        await deleteDocument(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : '削除に失敗しました');
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

  const canEditDocument = (document: any): boolean => {
    return user?.role === 'admin' || document.uploadedBy === user?.id;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          ドキュメント一覧
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setUploadOpen(true)}
        >
          ドキュメントをアップロード
        </Button>
      </Box>

      {loading ? (
        <Typography>読み込み中...</Typography>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ドキュメントがありません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDFファイルをアップロードして始めましょう
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Description sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div" noWrap>
                      {document.title}
                    </Typography>
                  </Box>
                  
                  {document.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {document.description}
                    </Typography>
                  )}

                  <Box mt={2}>
                    <Chip
                      label={formatFileSize(document.fileSize)}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label="PDF"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" display="block" mt={2} color="text.secondary">
                    {new Date(document.createdAt).toLocaleDateString('ja-JP')}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/documents/${document.id}`)}
                  >
                    表示
                  </Button>
                  
                  {canEditDocument(document) && (
                    <>
                      <IconButton
                        size="small"
                        color="primary"
                        title="編集"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(document.id)}
                        title="削除"
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ドキュメントをアップロード</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="タイトル"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            margin="dense"
            label="説明（任意）"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box
            {...getRootProps()}
            sx={{
              border: 2,
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderStyle: 'dashed',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            }}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <Box>
                <Description sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1">{selectedFile.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1">
                  {isDragActive ? 'ファイルをドロップしてください' : 'PDFファイルをドラッグ＆ドロップまたはクリックして選択'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  最大ファイルサイズ: 10MB
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>キャンセル</Button>
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

export default DocumentsPage;