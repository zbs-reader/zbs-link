import { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { documentTextOutline, openOutline, personOutline, pricetagsOutline, searchOutline } from 'ionicons/icons';
import { motion } from 'motion/react';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BookCard } from '../components/BookCard';
import { BottomDock } from '../components/BottomDock';
import { FeaturedShelf } from '../components/FeaturedShelf';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';
import { getAuthorRoute } from '../utils/author';

interface SearchResult {
  id: string;
  type: 'book' | 'author';
  title: string;
  subtitle: string;
  route: string;
}

const ALL_CATEGORY = '__all__';

const TEAM_LINKS = [
  {
    id: 'rulate-team',
    label: 'Rulate',
    caption: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043a\u043e\u043c\u0430\u043d\u0434\u044b',
    url: 'https://tl.rulate.ru/users/170114'
  },
  {
    id: 'ranobelib-team',
    label: 'RanobeLIB',
    caption: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043a\u043e\u043c\u0430\u043d\u0434\u044b',
    url: 'https://ranobelib.me/ru/team/64830--zabaichen-bank-selector'
  }
] as const;

export function HomePage() {
  const { catalog, loading, error } = useCatalog();
  const history = useHistory();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);

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
      const haystack = `${book.title} ${book.author} ${book.description} ${(book.tags ?? []).join(' ')}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog, normalizedQuery]);

  const featuredBooks = useMemo(() => {
    return [...(catalog?.books ?? [])]
      .sort((a, b) => {
        const aScore = Number(Boolean(a.isCompleted)) * 4 + Number(Boolean(a.accessTiers?.some((tier) => !tier.isFree))) * 2 + Number(Boolean(a.externalLinks?.length));
        const bScore = Number(Boolean(b.isCompleted)) * 4 + Number(Boolean(b.accessTiers?.some((tier) => !tier.isFree))) * 2 + Number(Boolean(b.externalLinks?.length));
        return bScore - aScore;
      })
      .slice(0, 8);
  }, [catalog]);

  const authorCount = useMemo(() => new Set((catalog?.books ?? []).map((book) => book.author)).size, [catalog]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [] as SearchResult[];
    }

    const results: SearchResult[] = [];

    for (const book of catalog?.books ?? []) {
      const bookHaystack = `${book.title} ${book.description} ${(book.tags ?? []).join(' ')}`.toLowerCase();
      const authorHaystack = book.author.toLowerCase();

      if (bookHaystack.includes(normalizedQuery)) {
        const tags = (book.tags ?? []).slice(0, 2).join(' \u2022 ');
        results.push({
          id: `book-${book.id}`,
          type: 'book',
          title: book.title,
          subtitle: tags ? `${book.author} \u2022 ${tags}` : book.author,
          route: `/book/${book.id}`
        });
      }

      if (authorHaystack.includes(normalizedQuery)) {
        results.push({
          id: `author-${book.id}`,
          type: 'author',
          title: book.author,
          subtitle: t('home.authorOf', { title: book.title }),
          route: getAuthorRoute(book.author)
        });
      }
    }

    return results.slice(0, 12);
  }, [catalog, normalizedQuery, t]);

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
          <div className="page-shell app-shell-stack home-layout">
            <section className="discover-sticky discover-sticky-top">
              <section className="search-shell compact-search">
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
                </div>
                <button type="button" className="search-action-button" aria-label={t('common.search')}>
                  <IonIcon icon={searchOutline} />
                </button>
              </section>

              {!isSearching ? (
                <div className="chips-row compact-filters">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`chip-button segmented-chip ${activeCategory === category ? 'active' : ''}`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category === ALL_CATEGORY ? t('common.all') : category}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <div className={`discover-sticky-spacer${isSearching ? '' : ' with-filters'}`} aria-hidden="true" />

            <motion.section
              className="hero-panel sleek-card"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="home-hero-grid">
                <div className="home-hero-copy product">
                  <p className="welcome-copy">{t('home.welcomeCopy')}</p>
                  <h1 className="welcome-title">{t('home.welcomeTitle')}</h1>
                  <p className="welcome-subtitle">{t('home.welcomeSubtitle')}</p>

                  <div className="hero-stat-row">
                    <div className="hero-stat-card">
                      <span className="hero-stat-value">{catalog.books.length}</span>
                      <span className="hero-stat-label">{t('common.books')}</span>
                    </div>
                    <div className="hero-stat-card">
                      <span className="hero-stat-value">{authorCount}</span>
                      <span className="hero-stat-label">{t('common.authors')}</span>
                    </div>
                    <div className="hero-stat-card">
                      <span className="hero-stat-value">{catalog.books.filter((book) => book.isCompleted).length}</span>
                      <span className="hero-stat-label">{t('common.completed')}</span>
                    </div>
                  </div>

                  <div className="hero-action-row">
                    <button type="button" className="hero-action-button primary" onClick={() => history.push('/levels')}>
                      <IonIcon icon={pricetagsOutline} />
                      <span>Boosty</span>
                    </button>
                    <button type="button" className="hero-action-button" onClick={() => history.push('/authors')}>
                      <IonIcon icon={personOutline} />
                      <span>{t('nav.browse')}</span>
                    </button>
                  </div>
                </div>

                <div className="hero-preview-stack">
                  {featuredBooks.slice(0, 3).map((book, index) => (
                    <motion.button
                      key={book.id}
                      type="button"
                      className={`hero-preview-card hero-preview-${index + 1}`}
                      onClick={() => history.push(`/book/${book.id}`)}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.06 * index }}
                    >
                      <img src={book.coverUrl} alt={book.title} className="hero-preview-cover" />
                      <span className="hero-preview-title">{book.title}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.section>

            <FeaturedShelf books={featuredBooks} />

            <section className="team-inline-bar">
              {TEAM_LINKS.map((platform) => (
                <a key={platform.id} className="team-inline-chip" href={platform.url} target="_blank" rel="noreferrer">
                  <span className="team-inline-copy">
                    <strong>{platform.label}</strong>
                    <span>{platform.caption}</span>
                  </span>
                  <IonIcon icon={openOutline} />
                </a>
              ))}
            </section>

            {isSearching ? (
              <section className="results-panel sleek-card">
                <div className="section-header compact-header">
                  <h2 className="section-title">{t('home.searchResults')}</h2>
                  <span className="section-caption">{searchResults.length} {t('common.found')}</span>
                </div>

                {searchResults.length ? (
                  <div className="search-results-list compact">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="search-result-card"
                        onClick={() => history.push(result.route)}
                      >
                        <div className={`search-result-icon ${result.type === 'author' ? 'author' : ''}`}>
                          <IonIcon icon={result.type === 'author' ? personOutline : documentTextOutline} />
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
              <section className="catalog-section sleek-card">
                <div className="section-header compact-header">
                  <div>
                    <h2 className="section-title">{t('home.topNovels')}</h2>
                    <p className="section-caption">{filteredBooks.length} {t('common.books')}</p>
                  </div>
                  <button type="button" className="section-link-button" onClick={() => setActiveCategory(ALL_CATEGORY)}>
                    {t('home.seeAll')}
                  </button>
                </div>
                <div className="catalog-grid dense-grid">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.28, delay: (index % 8) * 0.03 }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <BottomDock active="home" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
