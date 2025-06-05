import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
// Temporarily disable frourio due to aspida dependency issues
// import frourio from 'frourio';
// import api from './api/$api';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createAuthUseCases } from './application/use-cases/AuthUseCases';
import { createPrismaUserRepository } from './infrastructure/database/PrismaUserRepository';
import { createBcryptAuthService } from './infrastructure/services/BcryptAuthService';

dotenv.config();

const prisma = new PrismaClient();
const userRepository = createPrismaUserRepository(prisma);
const authService = createBcryptAuthService(process.env.JWT_SECRET || 'secret');
const authUseCases = createAuthUseCases(userRepository, authService);


const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

const start = async (): Promise<void> => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.mkdirSync(path.join(uploadsDir, 'documents'), { recursive: true });
      fs.mkdirSync(path.join(uploadsDir, 'audio'), { recursive: true });
    }

    await fastify.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : ['http://localhost:3000'],
      credentials: true,
    });

    await fastify.register(helmet, {
      contentSecurityPolicy: false,
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    });

    await fastify.register(staticFiles, {
      root: uploadsDir,
      prefix: '/files/',
      decorateReply: false,
      setHeaders: (res: any, path: string) => {
        // CORSヘッダーを設定
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
        res.setHeader('Accept-Ranges', 'bytes');
        
        // 音声ファイルの適切なMIMEタイプを設定
        if (path.endsWith('.mp3')) {
          res.setHeader('Content-Type', 'audio/mpeg');
        } else if (path.endsWith('.wav')) {
          res.setHeader('Content-Type', 'audio/wav');
        } else if (path.endsWith('.ogg')) {
          res.setHeader('Content-Type', 'audio/ogg');
        } else if (path.endsWith('.pdf')) {
          res.setHeader('Content-Type', 'application/pdf');
        }
      }
    });

    // Basic health check route
    fastify.get('/api/health', async (request, reply) => {
      return { status: 'ok', message: 'Backend server is running' };
    });

    // Auth routes
    fastify.post('/api/auth/register', async (request: any, reply: any) => {
      try {
        const { email, name, password } = request.body;
        const result = await authUseCases.register(email, name, password);
        return reply.status(201).send(result);
      } catch (error: any) {
        const message = error.message || 'ユーザー登録に失敗しました';
        return reply.status(400).send({ message, statusCode: 400 });
      }
    });

    fastify.post('/api/auth/login', async (request: any, reply: any) => {
      try {
        const { email, password } = request.body;
        const result = await authUseCases.login(email, password);
        return reply.status(200).send(result);
      } catch (error: any) {
        const message = error.message || 'ログインに失敗しました';
        return reply.status(401).send({ message, statusCode: 401 });
      }
    });

    // Document endpoints
    fastify.get('/api/documents', async (request: any, reply: any) => {
      try {
        const documentsDir = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(documentsDir)) {
          return reply.send([]);
        }

        const files = fs.readdirSync(documentsDir);
        const documents = files.map(filename => {
          const filepath = path.join(documentsDir, filename);
          const stats = fs.statSync(filepath);
          const originalName = filename.replace(/^\d+-/, ''); // Remove timestamp prefix
          
          // Extract timestamp from filename (e.g., 1749059928909-filename.pdf)
          const timestampMatch = filename.match(/^(\d+)-/);
          const createdAt = timestampMatch 
            ? new Date(parseInt(timestampMatch[1])).toISOString()
            : stats.mtime.toISOString();
          
          return {
            id: filename.replace(/\.[^/.]+$/, ''), // Use filename without extension as ID
            title: originalName.replace(/\.[^/.]+$/, ''), // Remove extension for title
            description: '',
            fileName: originalName,
            filePath: `documents/${filename}`,
            fileSize: stats.size,
            mimeType: 'application/pdf',
            uploadedBy: 'current-user-id',
            createdAt: createdAt,
            updatedAt: stats.mtime.toISOString()
          };
        });

        return reply.send(documents);
      } catch (error: any) {
        return reply.status(500).send({ message: 'ドキュメント一覧の取得に失敗しました' });
      }
    });

    fastify.post('/api/documents', async (request: any, reply: any) => {
      try {
        // Handle multipart file upload
        const data = await request.file();
        
        if (!data) {
          return reply.status(400).send({ message: 'ファイルが見つかりません' });
        }

        const buffer = await data.toBuffer();
        const filename = `${Date.now()}-${data.filename}`;
        const filepath = path.join(__dirname, '../uploads/documents', filename);
        
        // Save file
        fs.writeFileSync(filepath, buffer);

        // Extract form fields from request fields (if available)
        const fields = data.fields || {};
        const title = (fields as any).title?.value || data.filename;
        const description = (fields as any).description?.value || '';

        // Mock document response
        const document = {
          id: Date.now().toString(),
          title: title,
          description: description,
          fileName: data.filename,
          filePath: `documents/${filename}`,
          fileSize: buffer.length,
          mimeType: data.mimetype,
          uploadedBy: 'current-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return reply.status(201).send(document);
      } catch (error: any) {
        const message = error.message || 'ドキュメントのアップロードに失敗しました';
        return reply.status(400).send({ message, statusCode: 400 });
      }
    });

    // Document delete endpoint
    fastify.delete('/api/documents/:id', async (request: any, reply: any) => {
      try {
        const { id } = request.params;
        const documentsDir = path.join(__dirname, '../uploads/documents');
        
        // Find file by ID (filename without extension)
        const files = fs.readdirSync(documentsDir);
        const targetFile = files.find(filename => 
          filename.replace(/\.[^/.]+$/, '') === id
        );
        
        if (!targetFile) {
          return reply.status(404).send({ message: 'ドキュメントが見つかりません' });
        }
        
        const filepath = path.join(documentsDir, targetFile);
        fs.unlinkSync(filepath);
        
        return reply.status(200).send({ message: 'ドキュメントを削除しました' });
      } catch (error: any) {
        const message = error.message || 'ドキュメントの削除に失敗しました';
        return reply.status(500).send({ message, statusCode: 500 });
      }
    });

    // Audio endpoints
    fastify.get('/api/audios', async (request: any, reply: any) => {
      try {
        const audiosDir = path.join(__dirname, '../uploads/audio');
        if (!fs.existsSync(audiosDir)) {
          return reply.send([]);
        }

        const files = fs.readdirSync(audiosDir);
        const audios = files.map(filename => {
          const filepath = path.join(audiosDir, filename);
          const stats = fs.statSync(filepath);
          const originalName = filename.replace(/^\d+-/, ''); // Remove timestamp prefix
          const extension = path.extname(originalName).toLowerCase();
          
          // Extract timestamp from filename (e.g., 1749059928909-filename.mp3)
          const timestampMatch = filename.match(/^(\d+)-/);
          const createdAt = timestampMatch 
            ? new Date(parseInt(timestampMatch[1])).toISOString()
            : stats.mtime.toISOString();
          
          let mimeType = 'audio/mpeg';
          if (extension === '.wav') mimeType = 'audio/wav';
          else if (extension === '.ogg') mimeType = 'audio/ogg';
          
          return {
            id: filename.replace(/\.[^/.]+$/, ''), // Use filename without extension as ID
            title: originalName.replace(/\.[^/.]+$/, ''), // Remove extension for title
            description: '',
            fileName: originalName,
            filePath: `audio/${filename}`,
            fileSize: stats.size,
            mimeType: mimeType,
            uploadedBy: 'current-user-id',
            createdAt: createdAt,
            updatedAt: stats.mtime.toISOString()
          };
        });

        return reply.send(audios);
      } catch (error: any) {
        return reply.status(500).send({ message: '音声ファイル一覧の取得に失敗しました' });
      }
    });

    fastify.post('/api/audios', async (request: any, reply: any) => {
      try {
        // Handle multipart file upload
        const data = await request.file();
        
        if (!data) {
          return reply.status(400).send({ message: 'ファイルが見つかりません' });
        }

        const buffer = await data.toBuffer();
        const filename = `${Date.now()}-${data.filename}`;
        const filepath = path.join(__dirname, '../uploads/audio', filename);
        
        // Save file
        fs.writeFileSync(filepath, buffer);

        // Extract form fields from request fields (if available)
        const fields = data.fields || {};
        const title = (fields as any).title?.value || data.filename;
        const description = (fields as any).description?.value || '';

        // Mock audio response
        const audio = {
          id: Date.now().toString(),
          title: title,
          description: description,
          fileName: data.filename,
          filePath: `audio/${filename}`,
          fileSize: buffer.length,
          mimeType: data.mimetype,
          uploadedBy: 'current-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return reply.status(201).send(audio);
      } catch (error: any) {
        const message = error.message || '音声ファイルのアップロードに失敗しました';
        return reply.status(400).send({ message, statusCode: 400 });
      }
    });

    // Audio delete endpoint
    fastify.delete('/api/audios/:id', async (request: any, reply: any) => {
      try {
        const { id } = request.params;
        const audiosDir = path.join(__dirname, '../uploads/audio');
        
        // Find file by ID (filename without extension)
        const files = fs.readdirSync(audiosDir);
        const targetFile = files.find(filename => 
          filename.replace(/\.[^/.]+$/, '') === id
        );
        
        if (!targetFile) {
          return reply.status(404).send({ message: '音声ファイルが見つかりません' });
        }
        
        const filepath = path.join(audiosDir, targetFile);
        fs.unlinkSync(filepath);
        
        return reply.status(200).send({ message: '音声ファイルを削除しました' });
      } catch (error: any) {
        const message = error.message || '音声ファイルの削除に失敗しました';
        return reply.status(500).send({ message, statusCode: 500 });
      }
    });

    const port = Number(process.env.PORT) || 3002;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();