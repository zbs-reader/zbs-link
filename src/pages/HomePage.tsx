import { useMemo, useState } from 'react';
import { IonCheckbox, IonContent, IonIcon, IonPage } from '@ionic/react';
import { closeCircleOutline, documentTextOutline, personOutline, searchOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BookCard } from '../components/BookCard';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';
import { getAuthorRoute } from '../utils/author';

interface SearchResult {
  id: string;
  type: 'book' | 'chapter' | 'author';
  title: string;
  subtitle: string;
  route: string;
}

interface SearchFilters {
  books: boolean;
  chapters: boolean;
  authors: boolean;
}

const initialFilters: SearchFilters = {
  books: true,
  chapters: true,
  authors: true
};

const ALL_CATEGORY = '__all__';

export function HomePage() {
  const { catalog, loading, error } = useCatalog();
  const history = useHistory();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(initialFilters);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const categories = useMemo(() => {
    const tagSet = new Set<string>();
    catalog?.books.forEach((book) => book.tags?.forEach((tag) => tagSet.add(tag)));
    return [ALL_CATEGORY, ...Array.from(tagSet).slice(0, 7)];
  }, [catalog]);

  const filteredBooks = useMemo(() => {
    return (catalog?.books ?? []).filter((book) => {
      const matchesCategory = activeCategory === ALL_CATEGORY || book.tags?.includes(activeCategory);
      const haystack = `${book.title} ${book.author} ${(book.tags ?? []).join(' ')}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog, normalizedQuery]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [] as SearchResult[];
    }

    const results: SearchResult[] = [];

    for (const book of catalog?.books ?? []) {
      const bookHaystack = `${book.title} ${book.description} ${(book.tags ?? []).join(' ')}`.toLowerCase();
      const authorHaystack = book.author.toLowerCase();

      if (searchFilters.books && bookHaystack.includes(normalizedQuery)) {
        results.push({
          id: `book-${book.id}`,
          type: 'book',
          title: book.title,
          subtitle: `${book.author} | ${book.chapters.length} ${t('common.chapters')}`,
          route: `/book/${book.id}`
        });
      }

      if (searchFilters.authors && authorHaystack.includes(normalizedQuery)) {
        results.push({
          id: `author-${book.id}`,
          type: 'author',
          title: book.author,
          subtitle: t('home.authorOf', { title: book.title }),
          route: getAuthorRoute(book.author)
        });
      }

      if (searchFilters.chapters) {
        for (const chapter of book.chapters) {
          const chapterHaystack = `${chapter.title} ${chapter.excerpt ?? ''} ${book.title}`.toLowerCase();
          if (chapterHaystack.includes(normalizedQuery)) {
            results.push({
              id: `chapter-${book.id}-${chapter.id}`,
              type: 'chapter',
              title: chapter.title,
              subtitle: `${book.title} | ${chapter.excerpt ?? t('home.openChapter')}`,
              route: `/reader/${book.id}/${chapter.id}`
            });
          }
        }
      }
    }

    return results.slice(0, 12);
  }, [catalog, normalizedQuery, searchFilters, t]);

  const updateFilter = (key: keyof SearchFilters, checked?: boolean) => {
    setSearchFilters((current) => ({
      ...current,
      [key]: checked ?? false
    }));
  };

  return (
    <IonPage>
      <AppHeader title={t('header.libraryTitle')} subtitle={t('header.librarySubtitle')} />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('home.loadingTitle')} message={t('home.loadingMessage')} />
        ) : error ? (
          <StateView title={t('home.unavailableTitle')} message={error} actionLabel={t('common.tryAgain')} onAction={() => history.go(0)} />
        ) : !catalog?.books.length ? (
          <StateView title={t('home.noBooksTitle')} message={t('home.noBooksMessage')} />
        ) : (
          <div className="page-shell app-shell-stack">
            <section className="home-topbar">
              <div className="home-hero-copy">
                <p className="welcome-copy">{t('home.welcomeCopy')}</p>
                <h1 className="welcome-title">{t('home.welcomeTitle')}</h1>
                <p className="welcome-subtitle">{t('home.welcomeSubtitle')}</p>
              </div>
              <button type="button" className="icon-circle-button" onClick={() => history.push('/auth')} aria-label={t('common.account')}>
                <IonIcon icon={personOutline} />
              </button>
            </section>

            <section className="search-shell">
              <div className="search-input-wrap">
                <IonIcon icon={searchOutline} className="search-leading-icon" />
                <input
                  id="catalog-search"
                  name="catalog-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="search-input"
                  placeholder={t('home.searchPlaceholder')}
                />
                {isSearching ? (
                  <button type="button" className="search-clear-button" onClick={() => setQuery('')} aria-label={t('common.clearSearch')}>
                    <IonIcon icon={closeCircleOutline} />
                  </button>
                ) : null}
              </div>
              <button type="button" className="search-action-button" aria-label={t('common.search')}>
                <IonIcon icon={searchOutline} />
              </button>
            </section>

            {isSearching ? (
              <section>
                <div className="section-header compact-header">
                  <h2 className="section-title">{t('home.searchResults')}</h2>
                  <span className="section-caption">{searchResults.length} {t('common.found')}</span>
                </div>

                <div className="search-filter-row">
                  <label className="search-filter-chip">
                    <IonCheckbox checked={searchFilters.books} onIonChange={(event) => updateFilter('books', event.detail.checked)} />
                    <span>{t('home.booksFilter')}</span>
                  </label>
                  <label className="search-filter-chip">
                    <IonCheckbox checked={searchFilters.chapters} onIonChange={(event) => updateFilter('chapters', event.detail.checked)} />
                    <span>{t('home.chaptersFilter')}</span>
                  </label>
                  <label className="search-filter-chip">
                    <IonCheckbox checked={searchFilters.authors} onIonChange={(event) => updateFilter('authors', event.detail.checked)} />
                    <span>{t('home.authorsFilter')}</span>
                  </label>
                </div>

                {searchResults.length ? (
                  <div className="search-results-list">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="search-result-card"
                        onClick={() => history.push(result.route)}
                      >
                        <div className={`search-result-icon ${result.type === 'chapter' ? 'chapter' : result.type === 'author' ? 'author' : ''}`}>
                          <IonIcon icon={result.type === 'chapter' ? documentTextOutline : searchOutline} />
                        </div>
                        <div className="search-result-copy">
                          <p className="search-result-title">{result.title}</p>
                          <p className="search-result-subtitle">{result.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="search-empty-state">
                    <p className="section-title">{t('home.nothingMatched')}</p>
                    <p className="muted-text">{t('home.searchHint')}</p>
                  </div>
                )}
              </section>
            ) : (
              <>
                <section>
                  <div className="section-header compact-header">
                    <h2 className="section-title">{t('home.categories')}</h2>
                    <button type="button" className="section-link-button">{t('home.seeAll')}</button>
                  </div>
                  <div className="chips-row">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`chip-button ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category === ALL_CATEGORY ? t('common.all') : category}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="section-header compact-header">
                    <div>
                      <h2 className="section-title">{t('home.topNovels')}</h2>
                    </div>
                    <button type="button" className="section-link-button">{t('home.seeAll')}</button>
                  </div>
                  <div className="catalog-grid">
                    {filteredBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              </>
            )}

            <BottomDock active="home" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}