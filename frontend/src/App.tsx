import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SimpleDocumentsPage from './pages/SimpleDocumentsPage';
import SimpleAudiosPage from './pages/SimpleAudiosPage';

// シンプルなダッシュボードコンポーネント
const SimpleDashboard: React.FC = () => (
  <Box>
    <Typography variant="h4" component="h1" gutterBottom>
      ダッシュボード
    </Typography>
    <Typography variant="body1" gutterBottom>
      音声＆ドキュメント共有ポータルへようこそ
    </Typography>
    <Typography variant="body2" color="text.secondary">
      サイドバーからドキュメントや音声ファイルを管理できます。
    </Typography>
  </Box>
);

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SimpleDashboard />} />
        <Route path="/documents" element={<SimpleDocumentsPage />} />
        <Route path="/audios" element={<SimpleAudiosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;