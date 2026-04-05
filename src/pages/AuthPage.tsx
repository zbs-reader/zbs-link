import { IonContent, IonPage } from '@ionic/react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { useLanguage } from '../context/LanguageContext';

export function AuthPage(_props: RouteComponentProps) {
  const history = useHistory();
  const { t } = useLanguage();

  return (
    <IonPage>
      <AppHeader title={t('auth.title')} subtitle={t('auth.subtitle')} backHref="/" />
      <IonContent fullscreen>
        <div className="page-shell app-shell-stack">
          <section className="auth-card">
            <p className="hero-eyebrow">{t('auth.eyebrow')}</p>
            <h1 className="hero-title">{t('auth.heroTitle')}</h1>
            <p className="hero-subtitle">{t('auth.heroSubtitle')}</p>
            <button type="button" className="favorites-cta" onClick={() => history.push('/')}>{t('auth.backToLibrary')}</button>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}