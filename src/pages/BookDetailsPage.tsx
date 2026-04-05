import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { openOutline } from 'ionicons/icons';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useBook } from '../hooks/useBook';

interface BookRouteParams {
  bookId: string;
}

export function BookDetailsPage({ match }: RouteComponentProps<BookRouteParams>) {
  const { bookId } = match.params;
  const { book, loading, error } = useBook(bookId);
  const history = useHistory();
  const { t } = useLanguage();

  if (loading) {
    return (
      <IonPage>
        <AppHeader title={t('book.bookLabel')} subtitle={t('book.loadingDetails')} />
        <IonContent fullscreen>
          <StateView loading title={t('book.loadingTitle')} message={t('book.loadingMessage')} />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !book) {
    return (
      <IonPage>
        <AppHeader title={t('book.bookLabel')} />
        <IonContent fullscreen>
          <StateView title={t('book.unavailableTitle')} message={error ?? t('book.unavailableMessage')} actionLabel={t('book.backHome')} onAction={() => history.push('/')} />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title={book.title} subtitle={book.author} />
      <IonContent fullscreen>
        <div className="page-shell app-shell-stack">
          <section className="detail-spotlight">
            <img className="detail-cover-large" src={book.coverUrl} alt={`${book.title} cover`} />
            <div className="detail-copy">
              <p className="hero-eyebrow">{t('book.featuredStory')}</p>
              <h1 className="hero-title">{book.title}</h1>
              <p className="hero-subtitle">{book.description}</p>
              <div className="meta-pills-row">
                <span className="meta-pill">{book.author}</span>
                {(book.tags ?? []).slice(0, 4).map((tag) => <span key={tag} className="meta-pill">{tag}</span>)}
              </div>
            </div>
          </section>

          {book.externalLinks?.length ? (
            <section className="platforms-panel sleek-card">
              <div className="section-header compact-header">
                <h2 className="section-title">{t('book.platforms')}</h2>
                <span className="section-caption">{book.externalLinks.length} {t('common.links')}</span>
              </div>
              <div className="platform-links-grid">
                {book.externalLinks.map((platform) => (
                  <a key={platform.id} className="platform-link-card" href={platform.url} target="_blank" rel="noreferrer">
                    <span className="platform-link-label">{platform.label}</span>
                    <IonIcon icon={openOutline} />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {book.accessTiers?.length ? (
            <section className="tiers-panel sleek-card">
              <div className="section-header compact-header">
                <h2 className="section-title">{t('book.boosty')}</h2>
                <span className="section-caption">{book.accessTiers.length} {t('common.levels')}</span>
              </div>
              <div className="tiers-grid-compact">
                {book.accessTiers.map((tier) => (
                  <article key={tier.id} className={`tier-tile${tier.isFree ? ' tier-tile-free' : ''}`}>
                    <div className="tier-tile-head">
                      <span className={`tier-badge${tier.isFree ? ' tier-badge-free' : ''}`}>{tier.isFree ? 'FREE' : 'LEVEL'}</span>
                      <p className="tier-price-line">{tier.price}</p>
                    </div>
                    <h3 className="tier-title">{tier.title}</h3>
                    <p className="tier-description">{tier.description}</p>
                    {tier.chaptersLabel ? <p className="tier-meta-line">{tier.chaptersLabel}</p> : null}
                    {tier.linkUrl ? (
                      <a className="tier-link-button" href={tier.linkUrl} target="_blank" rel="noreferrer">
                        <IonIcon icon={openOutline} />
                        <span>{tier.linkLabel ?? t('common.open')}</span>
                      </a>
                    ) : (
                      <button type="button" className="tier-link-button muted" disabled>
                        <span>{t('common.soon')}</span>
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
}
