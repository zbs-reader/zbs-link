import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useCatalog } from '../hooks/useCatalog';
import type { AccessTier, BookSummary } from '../types/content';

const BOOSTY_LEVELS = [
  {
    id: 'free',
    title: 'FREE',
    price: '0 ₽',
    description: 'Открытые главы без подписки.'
  },
  {
    id: 'qi',
    title: 'Конденсация Ци',
    price: '300 ₽ per month',
    description: 'Дополнительно 300 глав.'
  },
  {
    id: 'core',
    title: 'Формирование Ядра',
    price: '600 ₽ per month',
    description: 'Дополнительно 600 глав.'
  },
  {
    id: 'soul',
    title: 'Зарождающаяся Душа',
    price: '1 200 ₽ per month',
    description: 'Доступ к 100% глав.'
  }
] as const;

type LevelKey = (typeof BOOSTY_LEVELS)[number]['id'];

function isFreeTier(tier: AccessTier): boolean {
  return Boolean(tier.isFree) || tier.title.trim().toUpperCase() === 'FREE';
}

function isFullTier(tier: AccessTier): boolean {
  const title = tier.title.trim().toLowerCase();
  const chaptersLabel = tier.chaptersLabel?.trim().toLowerCase() ?? '';
  return title.includes('полная версия') || chaptersLabel.includes('полностью');
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
    return paidTiers[Math.min(1, paidTiers.length - 1)];
  }

  const fullTier = paidTiers.find((tier) => isFullTier(tier));
  if (fullTier) {
    return fullTier;
  }

  return paidTiers[Math.min(2, paidTiers.length - 1)];
}

function getAccessValue(tier?: AccessTier): string {
  if (!tier) {
    return 'Скоро';
  }

  return tier.chaptersLabel?.trim() || tier.description?.trim() || tier.price?.trim() || 'Доступно';
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

function getTierBadge(tier?: AccessTier): string {
  if (!tier) {
    return 'Soon';
  }

  if (isFreeTier(tier)) {
    return 'FREE';
  }

  if (isFullTier(tier)) {
    return 'FULL';
  }

  return 'PAID';
}

export function BoostyLevelsPage() {
  const { catalog, loading, error } = useCatalog();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('free');

  const activeLevel = useMemo(
    () => BOOSTY_LEVELS.find((level) => level.id === selectedLevel) ?? BOOSTY_LEVELS[0],
    [selectedLevel]
  );

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

  if (loading) {
    return (
      <IonPage>
        <AppHeader title="Boosty уровни" subtitle="Подготавливаю сводку доступа" />
        <IonContent fullscreen>
          <StateView loading title="Загружаю уровни" message="Собираю общую матрицу доступа по всем книгам." />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !catalog) {
    return (
      <IonPage>
        <AppHeader title="Boosty уровни" />
        <IonContent fullscreen>
          <StateView title="Уровни недоступны" message={error ?? 'Не удалось собрать сводку по уровням Boosty.'} />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title="Boosty уровни" subtitle="Какие главы доступны на каждом уровне" />
      <IonContent fullscreen>
        <div className="page-shell app-shell-stack levels-layout">
          <motion.section
            className="levels-hero sleek-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="home-hero-copy product">
              <p className="welcome-copy">Подписка и доступ</p>
              <h1 className="welcome-title">Boosty как рабочая панель</h1>
              <p className="welcome-subtitle">Переключайте уровень и сразу смотрите, какой диапазон глав реально открывается по каждой книге.</p>
            </div>

            <div className="hero-stat-row compact">
              <div className="hero-stat-card">
                <span className="hero-stat-value">{stats.total}</span>
                <span className="hero-stat-label">Книг</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-value">{stats.available}</span>
                <span className="hero-stat-label">С доступом</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-value">{stats.full}</span>
                <span className="hero-stat-label">Full tiers</span>
              </div>
            </div>
          </motion.section>

          <LayoutGroup>
            <section className="boosty-level-grid compact-switcher">
              {BOOSTY_LEVELS.map((level) => {
                const selected = selectedLevel === level.id;

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
                      <p className="hero-eyebrow">Tier</p>
                      <h2 className="section-title">{level.title}</h2>
                      <p className="boosty-level-price">{level.price}</p>
                      <p className="muted-text">{level.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </section>
          </LayoutGroup>

          <section className="sleek-card boosty-matrix-card compact-matrix">
            <div className="section-header compact-header">
              <div>
                <h2 className="section-title">Доступ по книгам</h2>
                <p className="section-caption">Сейчас выбран уровень: {activeLevel.title}</p>
              </div>
            </div>

            <div className="boosty-book-list compact-grid">
              <AnimatePresence mode="popLayout">
                {catalog.books.map((book, index) => {
                  const tier = getTierForLevel(book, selectedLevel, activeLevel.title);
                  const accessValue = getAccessValue(tier);
                  const accessNote = getAccessNote(tier);
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
                          {book.isCompleted ? <span className="status-badge completed cover-status small">Завершена</span> : null}
                        </div>

                        <div className="boosty-book-copy">
                          <div className="comparison-header-row">
                            <p className="book-tile-kicker">{book.author}</p>
                            <span className={`comparison-badge ${statusBadge.toLowerCase()}`}>{statusBadge}</span>
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
                        <span>Открыть книгу</span>
                      </Link>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>

          <BottomDock active="levels" />
        </div>
      </IonContent>
    </IonPage>
  );
}
