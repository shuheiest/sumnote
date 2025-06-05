export interface Audio {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileSize: number;
  readonly duration?: number;
  readonly mimeType: string;
  readonly uploadedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const createAudio = (
  id: string,
  title: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  uploadedBy: string,
  description?: string,
  duration?: number,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): Audio => ({
  id,
  title,
  description,
  fileName,
  filePath,
  fileSize,
  duration,
  mimeType,
  uploadedBy,
  createdAt,
  updatedAt,
});

export const isMp3Audio = (audio: Audio): boolean =>
  audio.mimeType === 'audio/mpeg';

export const updateAudio = (
  audio: Audio,
  updates: Partial<Pick<Audio, 'title' | 'description' | 'duration'>>
): Audio => ({
  ...audio,
  ...updates,
  updatedAt: new Date(),
});