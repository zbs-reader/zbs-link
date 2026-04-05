import type { BookSummary, Catalog, ChapterMeta, ContentSourceConfig } from '../types/content';

const REMOTE_SOURCES = [
  'https://raw.githubusercontent.com/zbs-reader/translate-catalog-free/main',
  'https://cdn.jsdelivr.net/gh/zbs-reader/translate-catalog-free@main'
] as const;

interface ParsedBundledChapter {
  chapter: ChapterMeta;
  content: string;
}

const bundledChapterCache = new Map<string, ParsedBundledChapter[]>();

export class GitHubService {
  constructor(private readonly config: ContentSourceConfig) {}

  async getCatalog(): Promise<Catalog> {
    const localSources = ['/catalog.json'];
    const remoteSources = this.getRemoteBases().map((baseUrl) => this.withCacheBust(`${baseUrl}/catalog.json`));
    const sources = this.config.mode === 'local' ? [...localSources, ...remoteSources] : [...remoteSources, ...localSources];

    for (const source of sources) {
      try {
        const label = source.startsWith('http') ? `remote catalog from ${source}` : 'local catalog';
        const catalog = await this.fetchCatalog(source, label);
        return this.inflateBundledBooks(catalog);
      } catch {
        // Try the next source.
      }
    }

    throw new Error('Unable to load catalog.');
  }

  async getBook(bookId: string): Promise<BookSummary | undefined> {
    const catalog = await this.getCatalog();
    return catalog.books.find((book) => book.id === bookId);
  }

  async getChapterContent(bookId: string, chapterId: string): Promise<string> {
    const book = await this.getBook(bookId);
    if (!book) {
      throw new Error(`Book "${bookId}" was not found.`);
    }

    if (book.bundledChaptersPath) {
      const bundledChapters = await this.getBundledChapters(book.bundledChaptersPath);
      const bundledChapter = bundledChapters.find((item) => item.chapter.id === chapterId);
      if (!bundledChapter) {
        throw new Error(`Chapter "${chapterId}" was not found.`);
      }

      return bundledChapter.content;
    }

    const chapter = this.findChapter(book.chapters, chapterId);
    if (!chapter) {
      throw new Error(`Chapter "${chapterId}" was not found.`);
    }

    for (const url of this.getContentCandidates(chapter.contentPath)) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return response.text();
        }
      } catch {
        // Try the next candidate.
      }
    }

    throw new Error('Unable to load chapter content.');
  }

  private async fetchCatalog(url: string, sourceLabel: string): Promise<Catalog> {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Unable to load ${sourceLabel}.`);
    }

    return response.json() as Promise<Catalog>;
  }

  private async inflateBundledBooks(catalog: Catalog): Promise<Catalog> {
    const books = await Promise.all(
      catalog.books.map(async (book) => {
        const normalizedBook = this.normalizeBookPaths(book);

        if (!normalizedBook.bundledChaptersPath) {
          return normalizedBook;
        }

        const bundledChapters = await this.getBundledChapters(normalizedBook.bundledChaptersPath);
        return {
          ...normalizedBook,
          chapters: bundledChapters.map((item) => item.chapter)
        };
      })
    );

    return { books };
  }

  private normalizeBookPaths(book: BookSummary): BookSummary {
    return {
      ...book,
      coverUrl: this.normalizeAssetUrl(book.coverUrl),
      bundledChaptersPath: book.bundledChaptersPath ? this.normalizeContentPath(book.bundledChaptersPath) : undefined,
      chapters: book.chapters.map((chapter) => ({
        ...chapter,
        contentPath: this.normalizeContentPath(chapter.contentPath)
      }))
    };
  }

  private normalizeAssetUrl(url: string) {
    if (url.startsWith('http')) {
      return url;
    }

    const normalized = url.startsWith('/') ? url : `/${url}`;
    const remoteBase = this.getRemoteBases()[0];
    return remoteBase ? `${remoteBase}${normalized}` : normalized;
  }

  private normalizeContentPath(path: string) {
    if (path.startsWith('http')) {
      return path;
    }

    return path.startsWith('/') ? path : `/${path}`;
  }

  private async getBundledChapters(contentPath: string): Promise<ParsedBundledChapter[]> {
    const cached = bundledChapterCache.get(contentPath);
    if (cached) {
      return cached;
    }

    const normalizedPath = this.normalizeContentPath(contentPath);

    for (const url of this.getContentCandidates(normalizedPath)) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          continue;
        }

        const text = await response.text();
        const parsed = this.parseBundledChapters(text, normalizedPath);
        bundledChapterCache.set(contentPath, parsed);
        return parsed;
      } catch {
        // Try the next candidate.
      }
    }

    throw new Error('Unable to load bundled chapters.');
  }

  private parseBundledChapters(text: string, contentPath: string): ParsedBundledChapter[] {
    const normalized = text.replace(/^\uFEFF/, '');
    const headingPattern = /^Глава\s+(\d+)\.[^\r\n]*$/gm;
    const matches = Array.from(normalized.matchAll(headingPattern));

    if (!matches.length) {
      return [];
    }

    return matches.map((match, index) => {
      const title = match[0].trim();
      const order = Number(match[1]);
      const start = match.index ?? 0;
      const end = index + 1 < matches.length ? matches[index + 1].index ?? normalized.length : normalized.length;
      const content = normalized.slice(start, end).trim();
      const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const excerpt = lines.find((line) => line !== title)?.slice(0, 180);

      return {
        chapter: {
          id: `chapter-${order}`,
          title,
          order,
          contentPath,
          excerpt
        },
        content
      } satisfies ParsedBundledChapter;
    });
  }

  private findChapter(chapters: ChapterMeta[], chapterId: string) {
    return chapters.find((chapter) => chapter.id === chapterId);
  }

  private getRemoteBases() {
    if (this.config.mode === 'github' && this.config.baseUrl) {
      const preferredBase = this.config.baseUrl.replace(/\/$/, '');
      return [preferredBase, ...REMOTE_SOURCES.filter((url) => url !== preferredBase)];
    }

    if (this.config.mode === 'github') {
      return [...REMOTE_SOURCES];
    }

    return [] as string[];
  }

  private getContentCandidates(contentPath: string) {
    if (contentPath.startsWith('http')) {
      return [contentPath];
    }

    const normalizedPath = this.normalizeContentPath(contentPath);
    return [normalizedPath, ...this.getRemoteBases().map((baseUrl) => `${baseUrl}${normalizedPath}`)];
  }

  private withCacheBust(url: string) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}ts=${Date.now()}`;
  }
}

export const githubService = new GitHubService({
  mode: 'github',
  baseUrl: 'https://raw.githubusercontent.com/zbs-reader/translate-catalog-free/main'
});