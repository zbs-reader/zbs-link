import type { BookSummary, Catalog, ChapterMeta, CollectionBanner, ContentSourceConfig } from '../types/content';

const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export class GitHubService {
  constructor(private readonly config: ContentSourceConfig) {}

  async getCatalog(): Promise<Catalog> {
    const response = await fetch(this.resolveLocalUrl('/catalog.json'), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load catalog.');
    }

    const catalog = await response.json() as Catalog;
    return {
      books: catalog.books.map((book) => this.normalizeBookPaths(book)),
      banners: (catalog.banners ?? []).map((banner) => this.normalizeBannerPaths(banner))
    };
  }

  async getBook(bookId: string): Promise<BookSummary | undefined> {
    const catalog = await this.getCatalog();
    return catalog.books.find((book) => book.id === bookId);
  }

  async getChapterContent(_bookId: string, _chapterId: string): Promise<string> {
    throw new Error('Reading is disabled.');
  }

  private normalizeBookPaths(book: BookSummary): BookSummary {
    return {
      ...book,
      coverUrl: this.normalizeAssetUrl(book.coverUrl),
      bundledChaptersPath: book.bundledChaptersPath ? this.resolveLocalUrl(book.bundledChaptersPath) : undefined,
      chapters: (book.chapters ?? []).map((chapter) => this.normalizeChapter(chapter))
    };
  }

  private normalizeChapter(chapter: ChapterMeta): ChapterMeta {
    return {
      ...chapter,
      contentPath: chapter.contentPath ? this.resolveLocalUrl(chapter.contentPath) : ''
    };
  }

  private normalizeBannerPaths(banner: CollectionBanner): CollectionBanner {
    return {
      ...banner,
      backgroundUrl: banner.backgroundUrl ? this.normalizeAssetUrl(banner.backgroundUrl) : undefined
    };
  }

  private normalizeAssetUrl(url: string) {
    if (url.startsWith('http')) {
      return url;
    }

    return this.resolveLocalUrl(url);
  }

  private resolveLocalUrl(path: string) {
    const normalized = path.startsWith('/') ? path : `/${path}`;

    if (!APP_BASE) {
      return normalized;
    }

    if (normalized === APP_BASE || normalized.startsWith(`${APP_BASE}/`)) {
      return normalized;
    }

    return `${APP_BASE}${normalized}`;
  }
}

export const githubService = new GitHubService({
  mode: 'local'
});
