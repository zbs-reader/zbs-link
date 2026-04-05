import { useEffect, useState } from 'react';
import type { BookSummary, ReadingProgress } from '../types/content';
import { githubService } from '../services/githubService';
import { filesystemService } from '../services/filesystemService';
import { storageService } from '../services/storageService';

interface ReaderState {
  book: BookSummary | null;
  chapterContent: string;
  progress: ReadingProgress | null;
  isDownloaded: boolean;
  loading: boolean;
  error: string | null;
}

export function useReader(bookId: string, chapterId: string) {
  const [state, setState] = useState<ReaderState>({
    book: null,
    chapterContent: '',
    progress: null,
    isDownloaded: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    async function loadReader() {
      try {
        setState((current) => ({ ...current, loading: true, error: null }));

        const [book, localProgress, downloaded] = await Promise.all([
          githubService.getBook(bookId),
          storageService.getReadingProgressForBook(bookId),
          filesystemService.hasDownloadedChapter(bookId, chapterId)
        ]);

        if (!book) {
          throw new Error('Book not found.');
        }

        const chapterContent = await filesystemService.readLocalFirstChapter(bookId, chapterId, () =>
          githubService.getChapterContent(bookId, chapterId)
        );

        if (!cancelled) {
          setState({
            book,
            chapterContent,
            progress: localProgress ?? null,
            isDownloaded: downloaded,
            loading: false,
            error: null
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: loadError instanceof Error ? loadError.message : 'Failed to load reader.'
          }));
        }
      }
    }

    void loadReader();

    return () => {
      cancelled = true;
    };
  }, [bookId, chapterId]);

  const saveProgress = async (scrollPosition: number) => {
    const progress: ReadingProgress = {
      bookId,
      chapterId,
      scrollPosition,
      updatedAt: new Date().toISOString()
    };

    await storageService.saveReadingProgress(progress);
    setState((current) => {
      if (
        current.progress &&
        current.progress.chapterId === progress.chapterId &&
        Math.abs(current.progress.scrollPosition - progress.scrollPosition) < 24
      ) {
        return current;
      }

      return { ...current, progress };
    });
  };

  return { ...state, saveProgress };
}
