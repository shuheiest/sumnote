import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Grid,
} from '@mui/material';

// 単一のコンテンツカード用スケルトン
export const ContentCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
    </CardContent>
    <CardActions sx={{ justifyContent: 'space-between' }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={40} height={40} />
    </CardActions>
  </Card>
);

// グリッド表示用のスケルトンローダー
interface ContentGridSkeletonProps {
  count?: number;
}

export const ContentGridSkeleton: React.FC<ContentGridSkeletonProps> = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <ContentCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// リスト表示用のスケルトンローダー
export const ContentListSkeleton: React.FC<ContentGridSkeletonProps> = ({ count = 6 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
            </Box>
            <Box display="flex" gap={1}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// フィルター用のスケルトンローダー
export const FiltersLoaderSkeleton: React.FC = () => (
  <Card sx={{ p: 3, mb: 3 }}>
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={6} md={2}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={6} md={2}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={6} md={2}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
    </Grid>
    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
      <Skeleton variant="text" width={100} height={24} />
      <Skeleton variant="text" width={120} height={24} />
    </Box>
  </Card>
);

// ページ全体のローディング
export const PageLoadingSkeleton: React.FC<{ contentType: 'documents' | 'audios' }> = ({ 
  contentType 
}) => (
  <Box>
    {/* ヘッダー */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: 1 }} />
    </Box>

    {/* フィルター */}
    <FiltersLoaderSkeleton />

    {/* コンテンツグリッド */}
    <ContentGridSkeleton count={6} />
  </Box>
);

// エラー表示用コンポーネント
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <Box sx={{ color: 'error.main', mb: 2 }}>
        <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 2 }} />
      </Box>
      <Skeleton variant="text" width="60%" height={28} sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto', mb: 3 }} />
      {onRetry && (
        <Skeleton variant="rectangular" width={100} height={36} sx={{ mx: 'auto', borderRadius: 1 }} />
      )}
    </CardContent>
  </Card>
);

// 空状態表示用コンポーネント
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 6 }}>
      <Box sx={{ color: 'text.secondary', mb: 3 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
      </Box>
      <Skeleton variant="text" width="40%" height={32} sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', mb: 3 }} />
      {onAction && actionLabel && (
        <Skeleton variant="rectangular" width={200} height={36} sx={{ mx: 'auto', borderRadius: 1 }} />
      )}
    </CardContent>
  </Card>
);