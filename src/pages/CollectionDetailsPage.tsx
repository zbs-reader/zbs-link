import { IonContent, IonPage } from '@ionic/react';
import { useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BookCard } from '../components/BookCard';
import { BottomDock } from '../components/BottomDock';
import { CollectionBanner } from '../components/CollectionBanner';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';
import { getCollectionBooks } from '../utils/collections';

interface CollectionRouteParams {
  collectionId: string;
}

export function CollectionDetailsPage() {
  const history = useHistory();
  const { collectionId } = useParams<CollectionRouteParams>();
  const { t } = useLanguage();
  const { catalog, loading, error } = useCatalog();

  const books = catalog?.books ?? [];
  const banners = catalog?.banners ?? [];
  const banner = useMemo(() => banners.find((item) => item.id === collectionId), [banners, collectionId]);
  const linkedBooks = useMemo(() => (banner ? getCollectionBooks(banner, books) : []), [banner, books]);

  return (
    <IonPage>
      <AppHeader title={t('collections.detailTitle')} subtitle={banner?.title ?? t('collections.pageSubtitle')} />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('collections.loadingTitle')} message={t('collections.loadingMessage')} />
        ) : error ? (
          <StateView title={t('collections.unavailableTitle')} message={error} actionLabel={t('common.tryAgain')} onAction={() => history.go(0)} />
        ) : !banner ? (
          <StateView title={t('collections.notFoundTitle')} message={t('collections.notFoundMessage')} />
        ) : (
          <>
            <BottomDock active="home" />
            <div className="page-shell app-shell-stack collections-layout">
              <CollectionBanner banner={banner} books={books} variant="hero" />

              <section className="catalog-section sleek-card">
                <div className="section-header compact-header">
                  <div>
                    <p className="hero-eyebrow">{t('collections.defaultLabel')}</p>
                    <h2 className="section-title">{banner.title}</h2>
                    <p className="section-caption">{t('collections.booksCount', { count: linkedBooks.length })}</p>
                  </div>
                </div>

                <div className="catalog-grid dense-grid library-grid">
                  {linkedBooks.map((book) => (
                    <div key={book.id} className="library-book-card-wrap">
                      <BookCard book={book} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
