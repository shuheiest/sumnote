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
  Visibility,
  GetApp,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '../hooks/useDocuments';

const SimpleDocumentsPage: React.FC = () => {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setTitle(acceptedFiles[0].name.replace('.pdf', ''));
      }
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setUploading(true);
    try {
      await uploadDocument(selectedFile, title, description);
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
      await deleteDocument(id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleView = (document: any) => {
    // サーバーから提供されるPDFファイルのURLを開く
    const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/files/${document.filePath}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          ドキュメント
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          ドキュメント追加
        </Button>
      </Box>

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {doc.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {doc.description}
                </Typography>
                <Chip
                  label={new Date(doc.createdAt).toLocaleDateString('ja-JP')}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" justifyContent="space-between">
                  <IconButton onClick={() => handleView(doc)} color="primary">
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(doc.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {documents.length === 0 && !loading && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  ドキュメントがありません
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setOpen(true)}
                  sx={{ mt: 2 }}
                >
                  最初のドキュメントを追加
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ドキュメントアップロード</DialogTitle>
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
                : 'PDFファイルをドラッグ&ドロップまたはクリック'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              *.pdf ファイルのみ対応
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

export default SimpleDocumentsPage;