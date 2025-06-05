import axios from 'axios';
import type { User, AuthResponse, LoginRequest, RegisterRequest, Document, Audio, Comment, CreateCommentRequest } from '../api/@types';

const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3002') + '/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  auth: {
    $get: (): Promise<User> => 
      axiosInstance.get('/auth').then(res => res.data),
    login: {
      $post: ({ body }: { body: LoginRequest }): Promise<AuthResponse> =>
        axiosInstance.post('/auth/login', body).then(res => res.data),
    },
    register: {
      $post: ({ body }: { body: RegisterRequest }): Promise<AuthResponse> =>
        axiosInstance.post('/auth/register', body).then(res => res.data),
    },
  },
  documents: {
    $get: (): Promise<Document[]> =>
      axiosInstance.get('/documents').then(res => res.data),
    $post: ({ body }: { body: FormData }): Promise<Document> =>
      axiosInstance.post('/documents', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data),
    _id: (id: string) => ({
      $get: (): Promise<Document> =>
        axiosInstance.get(`/documents/${id}`).then(res => res.data),
      $put: ({ body }: { body: { title?: string; description?: string } }): Promise<Document> =>
        axiosInstance.put(`/documents/${id}`, body).then(res => res.data),
      $delete: (): Promise<void> =>
        axiosInstance.delete(`/documents/${id}`).then(res => res.data),
    }),
  },
  audios: {
    $get: (): Promise<Audio[]> =>
      axiosInstance.get('/audios').then(res => res.data),
    $post: ({ body }: { body: FormData }): Promise<Audio> =>
      axiosInstance.post('/audios', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data),
    _id: (id: string) => ({
      $get: (): Promise<Audio> =>
        axiosInstance.get(`/audios/${id}`).then(res => res.data),
      $put: ({ body }: { body: { title?: string; description?: string } }): Promise<Audio> =>
        axiosInstance.put(`/audios/${id}`, body).then(res => res.data),
      $delete: (): Promise<void> =>
        axiosInstance.delete(`/audios/${id}`).then(res => res.data),
    }),
  },
  comments: {
    $get: ({ query }: { query?: { documentId?: string; audioId?: string } } = {}): Promise<Comment[]> =>
      axiosInstance.get('/comments', { params: query }).then(res => res.data),
    $post: ({ body }: { body: CreateCommentRequest }): Promise<Comment> =>
      axiosInstance.post('/comments', body).then(res => res.data),
    _id: (id: string) => ({
      $put: ({ body }: { body: { content: string } }): Promise<Comment> =>
        axiosInstance.put(`/comments/${id}`, body).then(res => res.data),
      $delete: (): Promise<void> =>
        axiosInstance.delete(`/comments/${id}`).then(res => res.data),
    }),
  },
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};