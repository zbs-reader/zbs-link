export interface ChapterMeta {
  id: string;
  title: string;
  order: number;
  contentPath: string;
  excerpt?: string;
}

export interface AccessTier {
  id: string;
  title: string;
  price: string;
  description: string;
  isFree?: boolean;
  chaptersLabel?: string;
  linkUrl?: string;
  linkLabel?: string;
}

export interface ExternalPlatformLink {
  id: string;
  label: string;
  url: string;
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  chapters: ChapterMeta[];
  tags?: string[];
  accessTiers?: AccessTier[];
  externalLinks?: ExternalPlatformLink[];
  boostyBundleUrl?: string;
  bundledChaptersPath?: string;
  isCompleted?: boolean;
}

export interface CollectionBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  label?: string;
  backgroundUrl?: string;
  bookIds: string[];
}

export interface Catalog {
  books: BookSummary[];
  banners?: CollectionBanner[];
}

export interface ReadingProgress {
  bookId: string;
  chapterId: string;
  scrollPosition: number;
  updatedAt: string;
}

export interface DownloadedBookManifest {
  bookId: string;
  title: string;
  coverPath?: string;
  chapterPaths: Record<string, string>;
  downloadedAt: string;
}

export interface ContentSourceConfig {
  mode: 'local' | 'github';
  baseUrl?: string;
}
