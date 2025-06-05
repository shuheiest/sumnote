import { Audio } from '../entities/Audio';

export interface AudioRepository {
  findById: (id: string) => Promise<Audio | null>;
  findAll: () => Promise<Audio[]>;
  findByUserId: (userId: string) => Promise<Audio[]>;
  create: (audio: Omit<Audio, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Audio>;
  update: (id: string, audio: Partial<Audio>) => Promise<Audio | null>;
  delete: (id: string) => Promise<boolean>;
}