import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomDock } from '../components/BottomDock';
import { CollectionBanner } from '../components/CollectionBanner';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';

export function CollectionsPage() {
  const history = useHistory();
  const { t } = useLanguage();
  const { catalog, loading, error } = useCatalog();

  const books = catalog?.books ?? [];
  const banners = catalog?.banners ?? [];

  return (
    <IonPage>
      <AppHeader title={t('collections.pageTitle')} subtitle={t('collections.pageSubtitle')} />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('collections.loadingTitle')} message={t('collections.loadingMessage')} />
        ) : error ? (
          <StateView title={t('collections.unavailableTitle')} message={error} actionLabel={t('common.tryAgain')} onAction={() => history.go(0)} />
        ) : !banners.length ? (
          <StateView title={t('collections.emptyTitle')} message={t('collections.emptyMessage')} />
        ) : (
          <>
            <BottomDock active="home" />
            <div className="page-shell app-shell-stack collections-layout">
              <section className="collections-list">
                {banners.map((banner) => (
                  <CollectionBanner key={banner.id} banner={banner} books={books} variant="compact" />
                ))}
              </section>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
