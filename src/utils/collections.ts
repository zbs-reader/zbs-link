import type { BookSummary, CollectionBanner } from '../types/content';

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function seededShuffle<T>(items: T[], seed: number) {
  const clone = [...items];
  let state = seed || 1;

  for (let index = clone.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

export function getCollectionBooks(banner: CollectionBanner, books: BookSummary[]) {
  const byId = new Map(books.map((book) => [book.id, book]));
  return banner.bookIds.map((bookId) => byId.get(bookId)).filter((book): book is BookSummary => Boolean(book));
}

export function getCollectionPreviewBooks(banner: CollectionBanner, books: BookSummary[], limit = 3) {
  const linkedBooks = getCollectionBooks(banner, books);
  if (linkedBooks.length <= limit) {
    return linkedBooks;
  }

  const todaySeed = new Date().toISOString().slice(0, 10);
  return seededShuffle(linkedBooks, hashString(`${banner.id}-${todaySeed}`)).slice(0, limit);
}
