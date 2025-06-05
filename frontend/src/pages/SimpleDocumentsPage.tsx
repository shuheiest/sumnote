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
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  Description,
} from '@mui/icons-material';
import { useDocuments } from '../hooks/useDocuments';
import { useContentFilters } from '../hooks/useContentFilters';
import { DocumentUploadForm } from '../components/DocumentUploadForm';
import { ContentFilters } from '../components/ContentFilters';
import { ContentGridSkeleton, EmptyState } from '../components/SkeletonLoaders';
import { DocumentUploadFormData } from '../schemas/validation';

const SimpleDocumentsPage: React.FC = () => {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments();
  const { filters, setFilters, filteredItems, totalCount, filteredCount } = useContentFilters(documents);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleUpload = async (data: DocumentUploadFormData) => {
    setUploading(true);
    setUploadError('');
    try {
      await uploadDocument(data.file, data.title, data.description || '');
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

      {/* フィルター */}
      <ContentFilters
        filters={filters}
        onFiltersChange={setFilters}
        contentType="documents"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* コンテンツグリッド */}
      {loading ? (
        <ContentGridSkeleton count={6} />
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={3}>
          {filteredItems.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
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
                    <Description color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3" noWrap>
                      {doc.title}
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
                    {doc.description || 'No description'}
                  </Typography>
                  
                  <Chip
                    label={new Date(doc.createdAt).toLocaleDateString('ja-JP')}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                
                <Box display="flex" justifyContent="space-between" px={2} pb={2}>
                  <IconButton 
                    onClick={() => handleView(doc)} 
                    color="primary"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(doc.id)}
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
          title="ドキュメントがありません"
          description="最初のドキュメントをアップロードしてください"
          actionLabel="ドキュメントを追加"
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
        <DialogTitle>ドキュメントアップロード</DialogTitle>
        <DocumentUploadForm
          onSubmit={handleUpload}
          onCancel={handleCancel}
          loading={uploading}
          error={uploadError}
        />
      </Dialog>
    </Box>
  );
};

export default SimpleDocumentsPage;