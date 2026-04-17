import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { pricetagsOutline, searchOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BookCard } from '../components/BookCard';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';
import { estimateBookChapters, getBookChapterBucket, type ChapterBucket } from '../utils/library';

const ALL_AUTHORS = '__all_authors__';
const ALL_GENRES = '__all_genres__';

export function LibraryPage() {
  const history = useHistory();
  const { t } = useLanguage();
  const { catalog, loading, error } = useCatalog();
  const [query, setQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState(ALL_AUTHORS);
  const [genreFilter, setGenreFilter] = useState(ALL_GENRES);
  const [chapterFilter, setChapterFilter] = useState<ChapterBucket>('all');

  const authors = useMemo(() => {
    return Array.from(new Set((catalog?.books ?? []).map((book) => book.author))).sort((left, right) => left.localeCompare(right));
  }, [catalog]);

  const genres = useMemo(() => {
    const tagSet = new Set<string>();
    (catalog?.books ?? []).forEach((book) => book.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort((left, right) => left.localeCompare(right));
  }, [catalog]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (catalog?.books ?? []).filter((book) => {
      const haystack = `${book.title} ${book.author} ${book.description} ${(book.tags ?? []).join(' ')}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesAuthor = authorFilter === ALL_AUTHORS || book.author === authorFilter;
      const matchesGenre = genreFilter === ALL_GENRES || (book.tags ?? []).includes(genreFilter);
      const matchesChapters = chapterFilter === 'all' || getBookChapterBucket(book) === chapterFilter;

      return matchesQuery && matchesAuthor && matchesGenre && matchesChapters;
    });
  }, [authorFilter, catalog, chapterFilter, genreFilter, query]);

  const chapterOptions = [
    { value: 'all', label: t('library.allLengths') },
    { value: 'short', label: t('library.shortLength') },
    { value: 'medium', label: t('library.mediumLength') },
    { value: 'long', label: t('library.longLength') }
  ] as const;

  const resetFilters = () => {
    setQuery('');
    setAuthorFilter(ALL_AUTHORS);
    setGenreFilter(ALL_GENRES);
    setChapterFilter('all');
  };

  return (
    <IonPage>
      <AppHeader title={t('library.pageTitle')} subtitle={t('library.pageSubtitle')} />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('library.loadingTitle')} message={t('library.loadingMessage')} />
        ) : error ? (
          <StateView title={t('library.unavailableTitle')} message={error} actionLabel={t('common.tryAgain')} onAction={() => history.go(0)} />
        ) : (
          <>
            <BottomDock active="library" />
            <div className="page-shell app-shell-stack library-layout">
              <section className="library-toolbar sleek-card">
                <div className="search-shell compact-search static-search">
                  <div className="search-input-wrap">
                    <IonIcon icon={searchOutline} className="search-leading-icon" />
                    <input
                      id="library-search"
                      name="library-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="search-input"
                      placeholder={t('library.searchPlaceholder')}
                    />
                  </div>
                  <button type="button" className="search-action-button" aria-label={t('common.search')}>
                    <IonIcon icon={searchOutline} />
                  </button>
                </div>

                <div className="library-filters-grid">
                  <label className="library-filter-field">
                    <span className="library-filter-label">{t('library.authorsLabel')}</span>
                    <select value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className="library-filter-select">
                      <option value={ALL_AUTHORS}>{t('library.allAuthors')}</option>
                      {authors.map((author) => (
                        <option key={author} value={author}>
                          {author}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="library-filter-field">
                    <span className="library-filter-label">{t('library.genresLabel')}</span>
                    <select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)} className="library-filter-select">
                      <option value={ALL_GENRES}>{t('library.allGenres')}</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="library-filter-field">
                    <span className="library-filter-label">{t('library.chaptersLabel')}</span>
                    <select
                      value={chapterFilter}
                      onChange={(event) => setChapterFilter(event.target.value as ChapterBucket)}
                      className="library-filter-select"
                    >
                      {chapterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="library-toolbar-meta">
                  <p className="muted-text">{t('library.searchHint')}</p>
                  <button type="button" className="hero-action-button library-reset-button" onClick={resetFilters}>
                    <IonIcon icon={pricetagsOutline} />
                    <span>{t('library.resetFilters')}</span>
                  </button>
                </div>
              </section>

              <section className="catalog-section sleek-card">
                <div className="section-header compact-header">
                  <div>
                    <h2 className="section-title">{t('library.matchesTitle')}</h2>
                    <p className="section-caption">{t('library.matchesSubtitle', { count: filteredBooks.length })}</p>
                  </div>
                </div>

                {filteredBooks.length ? (
                  <div className="catalog-grid dense-grid library-grid">
                    {filteredBooks.map((book) => (
                      <div key={book.id} className="library-book-card-wrap">
                        <BookCard book={book} />
                        <div className="library-book-meta-line">
                          <span>{estimateBookChapters(book)} {t('common.chapters')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="search-empty-state library-empty-state">
                    <p className="section-title">{t('library.noMatchesTitle')}</p>
                    <p className="muted-text">{t('library.noMatchesMessage')}</p>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
