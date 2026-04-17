import type { AccessTier, BookSummary } from '../types/content';

export type ChapterBucket = 'all' | 'short' | 'medium' | 'long';

function parseChapterRange(value?: string): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[–—]/g, '-');
  const matches = Array.from(normalized.matchAll(/(\d+)(?:\s*-\s*(\d+))?/g));

  if (!matches.length) {
    return null;
  }

  return matches.reduce((max, match) => {
    const start = Number(match[1] ?? 0);
    const end = Number(match[2] ?? match[1] ?? 0);
    return Math.max(max, start, end);
  }, 0);
}

function estimateTierChapters(tier: AccessTier): number {
  return (
    parseChapterRange(tier.chaptersLabel) ??
    parseChapterRange(tier.description) ??
    parseChapterRange(tier.title) ??
    0
  );
}

export function estimateBookChapters(book: BookSummary): number {
  const chapterCount = book.chapters?.length
    ? Math.max(...book.chapters.map((chapter) => chapter.order || 0))
    : 0;

  const tierCount = Math.max(0, ...(book.accessTiers ?? []).map((tier) => estimateTierChapters(tier)));

  return Math.max(chapterCount, tierCount);
}

export function getBookChapterBucket(book: BookSummary): ChapterBucket {
  const count = estimateBookChapters(book);

  if (count >= 400) {
    return 'long';
  }

  if (count >= 150) {
    return 'medium';
  }

  return 'short';
}
