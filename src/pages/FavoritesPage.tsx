import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { bookmarkOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { useLanguage } from '../context/LanguageContext';

export function FavoritesPage() {
  const history = useHistory();
  const { t } = useLanguage();

  return (
    <IonPage>
      <AppHeader title={t('favorites.title')} subtitle={t('favorites.subtitle')} backHref="/" />
      <IonContent fullscreen className="home-page">
        <div className="page-shell app-shell-stack favorites-shell">
          <section className="favorites-hero">
            <div className="favorites-hero-icon">
              <IonIcon icon={bookmarkOutline} />
            </div>
            <h1 className="hero-title">{t('favorites.heroTitle')}</h1>
            <p className="hero-subtitle">{t('favorites.heroSubtitle')}</p>
            <button type="button" className="favorites-cta" onClick={() => history.push('/')}>{t('favorites.backToLibrary')}</button>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}