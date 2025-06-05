import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUpload, Upload } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { documentUploadSchema, DocumentUploadFormData } from '../schemas/validation';

interface DocumentUploadFormProps {
  onSubmit: (data: DocumentUploadFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  error,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DocumentUploadFormData>({
    resolver: yupResolver(documentUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      file: undefined,
    },
  });

  const selectedFile = watch('file');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setValue('file', file, { shouldValidate: true });
        // ファイル名からタイトルを自動設定（.pdfを除去）
        const titleFromFile = file.name.replace(/\.pdf$/i, '');
        setValue('title', titleFromFile, { shouldValidate: true });
      }
    },
  });

  const handleFormSubmit = async (data: DocumentUploadFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // エラーハンドリングは親コンポーネントで行う
      console.error('Upload error:', error);
    }
  };

  const isDisabled = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ファイルアップロードエリア */}
        <Controller
          name="file"
          control={control}
          render={({ field, fieldState }) => (
            <Box>
              <Box
                {...getRootProps()}
                sx={{
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: fieldState.error
                    ? 'error.main'
                    : isDragActive
                    ? 'primary.main'
                    : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  mb: 2,
                  '&:hover': !isDisabled && {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} disabled={isDisabled} />
                <CloudUpload 
                  sx={{ 
                    fontSize: 48, 
                    color: fieldState.error ? 'error.main' : 'text.secondary',
                    mb: 1 
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  {selectedFile
                    ? `選択済み: ${selectedFile.name}`
                    : 'PDFファイルをドラッグ&ドロップまたはクリック'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  *.pdf ファイルのみ対応（最大10MB）
                </Typography>
              </Box>
              {fieldState.error && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {fieldState.error.message}
                </Typography>
              )}
            </Box>
          )}
        />

        {/* アップロード進捗 */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              アップロード中...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* タイトル入力 */}
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="タイトル"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              margin="normal"
              disabled={isDisabled}
              placeholder="ドキュメントのタイトルを入力"
            />
          )}
        />

        {/* 説明入力 */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="説明（任意）"
              error={!!fieldState.error}
              helperText={fieldState.error?.message || '最大500文字'}
              margin="normal"
              multiline
              rows={3}
              disabled={isDisabled}
              placeholder="ドキュメントの説明を入力（任意）"
            />
          )}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} disabled={isDisabled}>
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isDisabled}
          startIcon={isSubmitting ? undefined : <Upload />}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? 'アップロード中...' : 'アップロード'}
        </Button>
      </DialogActions>
    </form>
  );
};