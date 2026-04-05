import { useEffect, useState } from 'react';
import type { BookSummary } from '../types/content';
import { githubService } from '../services/githubService';

export function useBook(bookId: string) {
  const [book, setBook] = useState<BookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBook() {
      try {
        setLoading(true);
        const nextBook = await githubService.getBook(bookId);
        if (!nextBook) {
          throw new Error('Book not found.');
        }

        if (!cancelled) {
          setBook(nextBook);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load book.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBook();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  return { book, loading, error };
}
