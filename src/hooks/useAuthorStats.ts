import { useMemo } from 'react';
import type { BookSummary } from '../types/content';

export interface AuthorStat {
  id: string;
  name: string;
  books: BookSummary[];
}

export function useAuthorStats(books: BookSummary[]) {
  const authors = useMemo<AuthorStat[]>(() => {
    const authorMap = new Map<string, AuthorStat>();

    for (const book of books) {
      const current = authorMap.get(book.author);

      if (current) {
        current.books.push(book);
      } else {
        authorMap.set(book.author, {
          id: encodeURIComponent(book.author),
          name: book.author,
          books: [book]
        });
      }
    }

    return Array.from(authorMap.values()).sort((left, right) => {
      if (right.books.length !== left.books.length) {
        return right.books.length - left.books.length;
      }

      return left.name.localeCompare(right.name);
    });
  }, [books]);

  return { authors, loading: false };
}
