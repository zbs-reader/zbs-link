import { Preferences } from '@capacitor/preferences';
import type { DownloadedBookManifest, ReadingProgress } from '../types/content';

const READING_PROGRESS_KEY = 'reading-progress';
const DOWNLOADED_BOOKS_KEY = 'downloaded-books';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const { value } = await Preferences.get({ key });
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

export const storageService = {
  async getReadingProgress(): Promise<Record<string, ReadingProgress>> {
    return readJson<Record<string, ReadingProgress>>(READING_PROGRESS_KEY, {});
  },

  async getReadingProgressForBook(bookId: string): Promise<ReadingProgress | undefined> {
    const allProgress = await this.getReadingProgress();
    return allProgress[bookId];
  },

  async saveReadingProgress(progress: ReadingProgress) {
    const allProgress = await this.getReadingProgress();
    allProgress[progress.bookId] = progress;
    await writeJson(READING_PROGRESS_KEY, allProgress);
  },

  async replaceReadingProgressIfNewer(progress: ReadingProgress) {
    const current = await this.getReadingProgressForBook(progress.bookId);
    if (!current || new Date(progress.updatedAt).getTime() >= new Date(current.updatedAt).getTime()) {
      await this.saveReadingProgress(progress);
      return progress;
    }

    return current;
  },

  async getDownloadedBooks(): Promise<Record<string, DownloadedBookManifest>> {
    return readJson<Record<string, DownloadedBookManifest>>(DOWNLOADED_BOOKS_KEY, {});
  },

  async getDownloadedBook(bookId: string): Promise<DownloadedBookManifest | undefined> {
    const allBooks = await this.getDownloadedBooks();
    return allBooks[bookId];
  },

  async saveDownloadedBook(manifest: DownloadedBookManifest) {
    const allBooks = await this.getDownloadedBooks();
    allBooks[manifest.bookId] = manifest;
    await writeJson(DOWNLOADED_BOOKS_KEY, allBooks);
  }
};
