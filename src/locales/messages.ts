export type Locale = 'ru' | 'en';

export interface Messages {
  common: {
    brandHomeAria: string;
    toggleTheme: string;
    toggleLanguage: string;
    search: string;
    clearSearch: string;
    account: string;
    chapters: string;
    chapter: string;
    books: string;
    authors: string;
    found: string;
    levels: string;
    links: string;
    open: string;
    soon: string;
    all: string;
    loading: string;
    tryAgain: string;
    completed: string;
  };
  nav: {
    mainNavigation: string;
    home: string;
    browse: string;
    favorites: string;
    account: string;
  };
  header: {
    libraryTitle: string;
    librarySubtitle: string;
  };
  home: {
    loadingTitle: string;
    loadingMessage: string;
    unavailableTitle: string;
    noBooksTitle: string;
    noBooksMessage: string;
    welcomeCopy: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    searchPlaceholder: string;
    searchResults: string;
    booksFilter: string;
    chaptersFilter: string;
    authorsFilter: string;
    nothingMatched: string;
    searchHint: string;
    categories: string;
    seeAll: string;
    topNovels: string;
    authorOf: string;
    openChapter: string;
  };
  authors: {
    pageTitle: string;
    pageSubtitle: string;
    loadingTitle: string;
    loadingMessage: string;
    unavailableTitle: string;
    explore: string;
    allAuthors: string;
    allAuthorsSubtitle: string;
    booksBy: string;
    titles: string;
    author: string;
    authorPage: string;
    authorLoadingTitle: string;
    authorLoadingMessage: string;
    authorUnavailable: string;
    authorNotFound: string;
    authorNotFoundMessage: string;
    backToAuthors: string;
  };
  auth: {
    title: string;
    subtitle: string;
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    backToLibrary: string;
  };
  favorites: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    backToLibrary: string;
  };
  book: {
    loadingTitle: string;
    loadingSubtitle: string;
    loadingMessage: string;
    unavailableTitle: string;
    unavailableMessage: string;
    backHome: string;
    featuredStory: string;
    startReading: string;
    chaptersSoon: string;
    downloadFile: string;
    downloadFb2: string;
    downloadMarkdown: string;
    platforms: string;
    boosty: string;
    searchPlaceholder: string;
    nothingFoundTitle: string;
    nothingFoundSubtitle: string;
    chaptersNotAddedTitle: string;
    chaptersNotAddedSubtitle: string;
    inBlock: string;
    groupTitle: string;
    author: string;
    buildingFile: string;
    buildingFb2: string;
    descriptionSectionTitle: string;
    downloadChapters: string;
    bookLabel: string;
    loadingDetails: string;
  };
  reader: {
    openingChapter: string;
    openingMessage: string;
    unavailableTitle: string;
    unavailableMessage: string;
    backToDetails: string;
    readerTitle: string;
    openChapterTitle: string;
    previousChapter: string;
    nextChapter: string;
    readerSettings: string;
    font: string;
    size: string;
    tone: string;
    themeTone: string;
    sepiaTone: string;
    contrastTone: string;
    chapterLabel: string;
    volumeChapterLabel: string;
  };
  bookCard: {
    novelMeta: string;
    catalogTag: string;
    coverAlt: string;
  };
}

export type TranslationKey = string;

export function interpolate(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => String(params[key.trim()] ?? ''));
}

export function getMessage(messages: Messages, path: TranslationKey): unknown {
  return path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current === 'string' || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, messages as unknown);
}