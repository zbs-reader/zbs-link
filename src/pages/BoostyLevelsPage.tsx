import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../hooks/useCatalog';
import type { AccessTier, BookSummary } from '../types/content';

const BOOSTY_LEVELS = [
  {
    id: 'free',
    title: 'FREE',
    price: '0 ₽',
    descriptionRu: 'Открытые главы без подписки.',
    descriptionEn: 'Open chapters without a subscription.'
  },
  {
    id: 'qi',
    title: 'Конденсация Ци',
    price: '300 ₽ per month',
    descriptionRu: 'Для всех новелл доступ до 500 глав. Если тайтл переводится только для RanobeLIB, открывается полный доступ.',
    descriptionEn: 'Up to 500 chapters for every novel. Titles translated only for RanobeLIB include full access.'
  },
  {
    id: 'core',
    title: 'Формирование Ядра',
    price: '500 ₽ per month',
    descriptionRu: 'Для работ в состоянии перевода доступ до 500 глав. Для работ с завершённым переводом — полный доступ.',
    descriptionEn: 'Up to 500 chapters for works still in translation, and full access for completed translations.'
  },
  {
    id: 'soul',
    title: 'Зарождающаяся Душа',
    price: '700 ₽ per month',
    descriptionRu: 'Доступ ко всему.',
    descriptionEn: 'Access to everything.'
  }
] as const;

type LevelKey = (typeof BOOSTY_LEVELS)[number]['id'];

function isFreeTier(tier: AccessTier): boolean {
  return Boolean(tier.isFree) || tier.title.trim().toUpperCase() === 'FREE';
}

function isFullTier(tier: AccessTier): boolean {
  const title = tier.title.trim().toLowerCase();
  const description = tier.description?.trim().toLowerCase() ?? '';
  const chaptersLabel = tier.chaptersLabel?.trim().toLowerCase() ?? '';

  return (
    title.includes('полная версия') ||
    title.includes('завершено') ||
    title.includes('full') ||
    description.includes('завершено') ||
    description.includes('full') ||
    chaptersLabel.includes('полностью')
  );
}

function getTierForLevel(book: BookSummary, levelId: LevelKey, levelTitle: string): AccessTier | undefined {
  const accessTiers = book.accessTiers ?? [];

  if (levelId === 'free') {
    return accessTiers.find((tier) => isFreeTier(tier));
  }

  const exactMatch = accessTiers.find((tier) => tier.title.trim() === levelTitle);
  if (exactMatch) {
    return exactMatch;
  }

  const paidTiers = accessTiers.filter((tier) => !isFreeTier(tier));
  if (!paidTiers.length) {
    return undefined;
  }

  if (levelId === 'qi') {
    return paidTiers[0];
  }

  if (levelId === 'core') {
    const completedFullTier = paidTiers.find((tier) => isFullTier(tier));
    if (book.isCompleted && completedFullTier) {
      return completedFullTier;
    }

    return paidTiers[Math.min(1, paidTiers.length - 1)];
  }

  const fullTier = paidTiers.find((tier) => isFullTier(tier));
  if (fullTier) {
    return fullTier;
  }

  return paidTiers[Math.min(2, paidTiers.length - 1)];
}

function getAccessValue(tier?: AccessTier, fallbackLabel = 'Available'): string {
  if (!tier) {
    return '';
  }

  return tier.chaptersLabel?.trim() || tier.description?.trim() || tier.price?.trim() || fallbackLabel;
}

function getAccessNote(tier?: AccessTier): string | undefined {
  if (!tier) {
    return undefined;
  }

  const description = tier.description?.trim();
  if (description && description !== tier.chaptersLabel?.trim()) {
    return description;
  }

  return undefined;
}

function getTierBadge(tier?: AccessTier): 'soon' | 'free' | 'full' | 'paid' {
  if (!tier) {
    return 'soon';
  }

  if (isFreeTier(tier)) {
    return 'free';
  }

  if (isFullTier(tier)) {
    return 'full';
  }

  return 'paid';
}

export function BoostyLevelsPage() {
  const { catalog, loading, error } = useCatalog();
  const { t, language } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('free');

  const activeLevel = useMemo(
    () => BOOSTY_LEVELS.find((level) => level.id === selectedLevel) ?? BOOSTY_LEVELS[0],
    [selectedLevel]
  );

  const activeDescription = language === 'ru' ? activeLevel.descriptionRu : activeLevel.descriptionEn;

  const stats = useMemo(() => {
    const books = catalog?.books ?? [];
    return {
      total: books.length,
      available: books.filter((book) => getTierForLevel(book, selectedLevel, activeLevel.title)).length,
      full: books.filter((book) => {
        const tier = getTierForLevel(book, selectedLevel, activeLevel.title);
        return Boolean(tier && isFullTier(tier));
      }).length
    };
  }, [activeLevel.title, catalog?.books, selectedLevel]);

  const badgeLabel = (badge: ReturnType<typeof getTierBadge>) => {
    switch (badge) {
      case 'free':
        return 'FREE';
      case 'full':
        return t('book.tierBadgeFull');
      case 'paid':
        return t('book.tierBadgePaid');
      default:
        return t('common.soon');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <AppHeader title={t('levels.pageTitle')} subtitle={t('levels.pageSubtitle')} />
        <IonContent fullscreen>
          <StateView loading title={t('levels.loadingTitle')} message={t('levels.loadingMessage')} />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !catalog) {
    return (
      <IonPage>
        <AppHeader title={t('levels.pageTitle')} />
        <IonContent fullscreen>
          <StateView title={t('levels.unavailableTitle')} message={error ?? t('levels.unavailableMessage')} />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title={t('levels.pageTitle')} subtitle={t('levels.pageSubtitle')} />
      <IonContent fullscreen>
        <>
          <BottomDock active="levels" />
          <div className="page-shell app-shell-stack levels-layout">
            <motion.section
              className="levels-hero sleek-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="home-hero-copy product">
                <p className="welcome-copy">{t('levels.heroEyebrow')}</p>
                <h1 className="welcome-title">{t('levels.heroTitle')}</h1>
                <p className="welcome-subtitle">{t('levels.heroSubtitle')}</p>
              </div>

              <div className="hero-stat-row compact">
                <div className="hero-stat-card">
                  <span className="hero-stat-value">{stats.total}</span>
                  <span className="hero-stat-label">{t('levels.totalBooksLabel')}</span>
                </div>
                <div className="hero-stat-card">
                  <span className="hero-stat-value">{stats.available}</span>
                  <span className="hero-stat-label">{t('levels.availableBooksLabel')}</span>
                </div>
                <div className="hero-stat-card">
                  <span className="hero-stat-value">{stats.full}</span>
                  <span className="hero-stat-label">{t('levels.fullTiersLabel')}</span>
                </div>
              </div>
            </motion.section>

            <LayoutGroup>
              <section className="boosty-level-grid compact-switcher">
                {BOOSTY_LEVELS.map((level) => {
                  const selected = selectedLevel === level.id;
                  const description = language === 'ru' ? level.descriptionRu : level.descriptionEn;

                  return (
                    <motion.button
                      key={level.id}
                      type="button"
                      className={`sleek-card boosty-level-card switcher-card ${selected ? 'active' : ''}`}
                      onClick={() => setSelectedLevel(level.id)}
                      whileTap={{ scale: 0.985 }}
                      layout
                    >
                      {selected ? <motion.span layoutId="active-level-pill" className="boosty-level-active-fill" /> : null}
                      <div className="boosty-level-card-copy">
                        <p className="hero-eyebrow">{t('levels.tierEyebrow')}</p>
                        <h2 className="section-title">{level.title}</h2>
                        <p className="boosty-level-price">{level.price}</p>
                        <p className="muted-text">{description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </section>
            </LayoutGroup>

            {activeLevel.id === 'qi' ? (
              <Link to="/collections/ranobelib-full-access" className="level-card-inline-link sleek-card">
                Смотреть список тайтлов с полным доступом на RanobeLIB
              </Link>
            ) : null}

            <section className="sleek-card boosty-matrix-card compact-matrix">
              <div className="section-header compact-header">
                <div>
                  <h2 className="section-title">{t('levels.matrixTitle')}</h2>
                  <p className="section-caption">{t('levels.selectedLevel', { title: activeLevel.title })}</p>
                </div>
              </div>

              <div className="boosty-book-list compact-grid">
                <AnimatePresence mode="popLayout">
                  {catalog.books.map((book, index) => {
                    const tier = getTierForLevel(book, selectedLevel, activeLevel.title);
                    const accessValue = tier ? getAccessValue(tier, t('levels.availableLabel')) : t('common.soon');
                    const accessNote = tier ? getAccessNote(tier) : activeDescription;
                    const statusBadge = getTierBadge(tier);

                    return (
                      <motion.article
                        key={`${selectedLevel}-${book.id}`}
                        className="boosty-book-card compact-card comparison-card"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22, delay: index * 0.02 }}
                        layout
                      >
                        <div className="boosty-book-compact-top">
                          <div className="boosty-book-cover-wrap">
                            <img className="boosty-book-cover" src={book.coverUrl} alt={book.title} />
                            {book.isCompleted ? <span className="status-badge completed cover-status small">{t('common.completed')}</span> : null}
                          </div>

                          <div className="boosty-book-copy">
                            <div className="comparison-header-row">
                              <p className="book-tile-kicker">{book.author}</p>
                              <span className={`comparison-badge ${statusBadge}`}>{badgeLabel(statusBadge)}</span>
                            </div>
                            <h3 className="boosty-book-title compact">{book.title}</h3>

                            <div className="boosty-access-grid single-level compact">
                              <div className="boosty-access-row active-row compact-row">
                                <span className="boosty-access-label">{activeLevel.title}</span>
                                <span className="boosty-access-value">{accessValue}</span>
                              </div>
                            </div>

                            {accessNote ? <p className="boosty-access-note compact-note">{accessNote}</p> : null}
                          </div>
                        </div>

                        <Link to={`/book/${book.id}`} className="tier-link-button boosty-book-link compact-link compare-link">
                          <span>{t('common.open')}</span>
                        </Link>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </>
      </IonContent>
    </IonPage>
  );
}
