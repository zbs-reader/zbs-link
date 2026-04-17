import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { arrowForwardOutline, openOutline, peopleOutline, pricetagsOutline } from 'ionicons/icons';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomDock } from '../components/BottomDock';
import { CollectionBanner } from '../components/CollectionBanner';
import { CompletedShelf } from '../components/CompletedShelf';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';

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
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const books = catalog?.books ?? [];
  const banners = catalog?.banners ?? [];
  const completedBooks = books.filter((book) => book.isCompleted);
  const featuredBanner = banners[activeBannerIndex] ?? banners[0];
  const authorCount = new Set(books.map((book) => book.author)).size;
  const genreCount = new Set(books.flatMap((book) => book.tags ?? [])).size;
  const completedCount = books.filter((book) => book.isCompleted).length;

  useEffect(() => {
    setActiveBannerIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [banners.length]);

  const changeBanner = (nextIndex: number) => {
    if (nextIndex === activeBannerIndex) {
      return;
    }

    setActiveBannerIndex(nextIndex);
  };

  return (
    <IonPage>
      <AppHeader title={t('header.libraryTitle')} subtitle={t('header.librarySubtitle')} />
      <IonContent fullscreen className="home-page">
        {loading ? (
          <StateView loading title={t('home.loadingTitle')} message={t('home.loadingMessage')} />
        ) : error ? (
          <StateView title={t('home.unavailableTitle')} message={error} actionLabel={t('common.tryAgain')} onAction={() => history.go(0)} />
        ) : !books.length ? (
          <StateView title={t('home.noBooksTitle')} message={t('home.noBooksMessage')} />
        ) : (
          <>
            <BottomDock active="home" />
            <div className="page-shell app-shell-stack home-layout compact-home-layout">
              <motion.section
                className="hero-panel sleek-card home-overview-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                <div className="home-overview-copy">
                  <p className="welcome-copy">{t('home.welcomeCopy')}</p>
                  <h1 className="welcome-title">{t('home.welcomeTitle')}</h1>
                  <p className="welcome-subtitle">{t('home.welcomeSubtitle')}</p>
                </div>

                <div className="hero-stat-row compact-home-stats">
                  <div className="hero-stat-card">
                    <span className="hero-stat-value">{books.length}</span>
                    <span className="hero-stat-label">{t('common.books')}</span>
                  </div>
                  <div className="hero-stat-card">
                    <span className="hero-stat-value">{authorCount}</span>
                    <span className="hero-stat-label">{t('common.authors')}</span>
                  </div>
                  <div className="hero-stat-card">
                    <span className="hero-stat-value">{genreCount}</span>
                    <span className="hero-stat-label">{t('home.categories')}</span>
                  </div>
                  <div className="hero-stat-card">
                    <span className="hero-stat-value">{completedCount}</span>
                    <span className="hero-stat-label">{t('common.completed')}</span>
                  </div>
                </div>

                <div className="hero-action-row compact-home-actions">
                  <button type="button" className="hero-action-button primary" onClick={() => history.push('/library')}>
                    <IonIcon icon={peopleOutline} />
                    <span>{t('home.openLibrary')}</span>
                  </button>
                  <button type="button" className="hero-action-button" onClick={() => history.push('/levels')}>
                    <IonIcon icon={pricetagsOutline} />
                    <span>Boosty</span>
                  </button>
                </div>
              </motion.section>

              <section className="collections-home-block sleek-cardless-section">
                <div className="section-header compact-header collection-home-header">
                  <div>
                    <p className="hero-eyebrow">{t('collections.defaultLabel')}</p>
                    <h2 className="section-title">{t('home.bannerTitle')}</h2>
                    <p className="section-caption">{t('home.bannerSubtitle')}</p>
                  </div>
                  <button type="button" className="section-link-button collection-header-link" onClick={() => history.push('/collections')}>
                    <span>{t('collections.viewAll')}</span>
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </div>

                {featuredBanner ? (
                  <div className="home-banner-grid">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={featuredBanner.id}
                        className="home-banner-primary"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <CollectionBanner banner={featuredBanner} books={books} />
                      </motion.div>
                    </AnimatePresence>

                    {banners.length > 1 ? (
                      <div className="home-banner-pager" aria-label={t('collections.pageTitle')}>
                        {banners.map((banner, index) => (
                          <button
                            key={banner.id}
                            type="button"
                            className={`home-banner-dot ${index === activeBannerIndex ? 'active' : ''}`}
                            aria-label={banner.title}
                            onClick={() => changeBanner(index)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <section className="banner-slot-card sleek-card">
                    <div className="banner-slot-copy">
                      <p className="hero-eyebrow">{t('collections.defaultLabel')}</p>
                      <h2 className="section-title">{t('home.bannerTitle')}</h2>
                      <p className="muted-text">{t('home.bannerSubtitle')}</p>
                    </div>
                  </section>
                )}
              </section>

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

              <CompletedShelf books={completedBooks} />
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
