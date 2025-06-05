import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Description,
  AudioFile,
  Upload,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import { useAudios } from '../hooks/useAudios';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const { audios } = useAudios();

  const recentDocuments = documents.slice(0, 5);
  const recentAudios = audios.slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'primary.main',
              color: 'white',
            }}
          >
            <Description sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{documents.length}</Typography>
              <Typography variant="body2">ドキュメント</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'secondary.main',
              color: 'white',
            }}
          >
            <AudioFile sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{audios.length}</Typography>
              <Typography variant="body2">音声ファイル</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'success.main',
              color: 'white',
            }}
          >
            <Upload sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{documents.length + audios.length}</Typography>
              <Typography variant="body2">総アップロード数</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'info.main',
              color: 'white',
            }}
          >
            <TrendingUp sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h4">今月</Typography>
              <Typography variant="body2">アクティブ</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">最新のドキュメント</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/documents')}
                >
                  すべて表示
                </Button>
              </Box>
              {recentDocuments.length === 0 ? (
                <Typography color="text.secondary">
                  ドキュメントがありません
                </Typography>
              ) : (
                recentDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid"
                    borderColor="divider"
                  >
                    <Box>
                      <Typography variant="body1">{doc.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.createdAt).toLocaleDateString('ja-JP')}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      表示
                    </Button>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">最新の音声ファイル</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/audios')}
                >
                  すべて表示
                </Button>
              </Box>
              {recentAudios.length === 0 ? (
                <Typography color="text.secondary">
                  音声ファイルがありません
                </Typography>
              ) : (
                recentAudios.map((audio) => (
                  <Box
                    key={audio.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid"
                    borderColor="divider"
                  >
                    <Box>
                      <Typography variant="body1">{audio.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(audio.createdAt).toLocaleDateString('ja-JP')}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate(`/audios/${audio.id}`)}
                    >
                      表示
                    </Button>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;