import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useAuthorStats } from '../hooks/useAuthorStats';
import { useCatalog } from '../hooks/useCatalog';
import { getAuthorRoute } from '../utils/author';

export function AuthorsPage() {
  const history = useHistory();
  const { t } = useLanguage();
  const { catalog, loading, error } = useCatalog();
  const { authors } = useAuthorStats(catalog?.books ?? []);

  return (
    <IonPage>
      <AppHeader title={t('authors.pageTitle')} subtitle={t('authors.pageSubtitle')} backHref="/" />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('authors.loadingTitle')} message={t('authors.loadingMessage')} />
        ) : error ? (
          <StateView title={t('authors.unavailableTitle')} message={error} actionLabel={t('common.tryAgain')} onAction={() => history.go(0)} />
        ) : (
          <div className="page-shell app-shell-stack authors-shell">
            <section className="favorites-hero compact">
              <p className="hero-eyebrow">{t('authors.explore')}</p>
              <h1 className="hero-title">{t('authors.allAuthors')}</h1>
              <p className="hero-subtitle">{t('authors.allAuthorsSubtitle')}</p>
            </section>

            <section className="authors-list">
              {authors.map((author) => (
                <button key={author.id} type="button" className="author-card" onClick={() => history.push(getAuthorRoute(author.name))}>
                  <div className="author-card-icon">
                    <IonIcon icon={personOutline} />
                  </div>
                  <div className="author-card-copy">
                    <p className="author-card-title">{author.name}</p>
                    <p className="author-card-subtitle">{author.books.length} {t('common.books')}</p>
                  </div>
                </button>
              ))}
            </section>

            <BottomDock active="browse" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}