import type { ReadingProgress } from '../types/content';

export const syncService = {
  async getRemoteReadingProgress(_bookId: string): Promise<ReadingProgress | null> {
    return null;
  },

  async syncReadingProgress(_progress: ReadingProgress) {
    return;
  }
};
