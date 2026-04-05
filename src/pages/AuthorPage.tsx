import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BookCard } from '../components/BookCard';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useAuthorStats } from '../hooks/useAuthorStats';
import { useCatalog } from '../hooks/useCatalog';
import { parseAuthorRouteParam } from '../utils/author';

interface AuthorRouteParams {
  authorId: string;
}

export function AuthorPage({ match }: RouteComponentProps<AuthorRouteParams>) {
  const history = useHistory();
  const { t } = useLanguage();
  const authorName = parseAuthorRouteParam(match.params.authorId);
  const { catalog, loading, error } = useCatalog();
  const { authors } = useAuthorStats(catalog?.books ?? []);
  const author = authors.find((entry) => entry.name === authorName);

  return (
    <IonPage>
      <AppHeader title={authorName} subtitle={t('authors.authorPage')} backHref="/authors" />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('authors.authorLoadingTitle')} message={t('authors.authorLoadingMessage')} />
        ) : error ? (
          <StateView title={t('authors.authorUnavailable')} message={error} actionLabel={t('authors.backToAuthors')} onAction={() => history.push('/authors')} />
        ) : !author ? (
          <StateView title={t('authors.authorNotFound')} message={t('authors.authorNotFoundMessage')} actionLabel={t('authors.backToAuthors')} onAction={() => history.push('/authors')} />
        ) : (
          <div className="page-shell app-shell-stack authors-shell">
            <section className="author-hero">
              <div className="author-card-icon large">
                <IonIcon icon={personOutline} />
              </div>
              <div className="author-hero-copy">
                <p className="hero-eyebrow">{t('authors.author')}</p>
                <h1 className="hero-title">{author.name}</h1>
                <div className="author-stats-row">
                  <span className="meta-pill">{author.books.length} {t('common.books')}</span>
                </div>
              </div>
            </section>

            <section>
              <div className="section-header compact-header">
                <h2 className="section-title">{t('authors.booksBy', { name: author.name })}</h2>
                <span className="section-caption">{author.books.length} {t('authors.titles')}</span>
              </div>
              <div className="author-books-grid">
                {author.books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>

            <BottomDock active="browse" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}