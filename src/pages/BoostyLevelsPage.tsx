import { IonContent, IonPage } from '@ionic/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomDock } from '../components/BottomDock';
import { StateView } from '../components/StateView';
import { useCatalog } from '../hooks/useCatalog';

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
    description: 'Доступ к 50% глав с ранним доступом.'
  },
  {
    id: 'core',
    title: 'Формирование Ядра',
    price: '900 ₽ per month',
    description: 'Доступ к 75% глав с ранним доступом (+ если завершённая книга содержит меньше 500 глав, полный доступ).'
  },
  {
    id: 'soul',
    title: 'Зарождающаяся Душа',
    price: '1 500 ₽ per month',
    description: 'Доступ к 100% глав с ранним доступом.'
  }
] as const;

type LevelKey = (typeof BOOSTY_LEVELS)[number]['id'];

interface AccessMap {
  free: string;
  qi: string;
  core: string;
  soul: string;
  note?: string;
}

function getAccessMap(bookId: string): AccessMap {
  switch (bookId) {
    case 'gentleman-at-the-abyss':
      return {
        free: '1-315',
        qi: '1-674',
        core: '1-873',
        soul: '1-1112',
        note: 'Завершённая книга больше 500 глав, поэтому полный доступ только на высшем уровне.'
      };
    case 'path-of-cultivation-skin-creation':
      return {
        free: '1-122',
        qi: '1-199',
        core: '1-351',
        soul: '1-351',
        note: 'Книга завершена и меньше 500 глав, поэтому Формирование Ядра уже даёт полный доступ.'
      };
    case 'plants-and-zombies-stronger':
      return {
        free: '1-220',
        qi: '1-400',
        core: '1-400',
        soul: '1-400',
        note: 'Сейчас на Boosty доступен один расширенный блок глав поверх FREE.'
      };
    case 'the-abnormal-supernatural-world':
      return {
        free: '1-225',
        qi: '1-400',
        core: '1-400',
        soul: '1-400',
        note: 'Сейчас на Boosty доступен один расширенный блок глав поверх FREE.'
      };
    default:
      return {
        free: 'Скоро',
        qi: 'Скоро',
        core: 'Скоро',
        soul: 'Скоро'
      };
  }
}

export function BoostyLevelsPage() {
  const { catalog, loading, error } = useCatalog();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('free');

  const activeLevel = useMemo(
    () => BOOSTY_LEVELS.find((level) => level.id === selectedLevel) ?? BOOSTY_LEVELS[0],
    [selectedLevel]
  );

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
        <div className="page-shell app-shell-stack">
          <section className="home-topbar">
            <div className="home-hero-copy">
              <p className="welcome-copy">Подписка и доступ</p>
              <h1 className="welcome-title">Сводка по уровням Boosty</h1>
              <p className="welcome-subtitle">Нажмите на уровень сверху, и ниже останется только доступ для этого уровня по всем книгам.</p>
            </div>
          </section>

          <section className="boosty-level-grid">
            {BOOSTY_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                className={`sleek-card boosty-level-card ${selectedLevel === level.id ? 'active' : ''}`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <p className="hero-eyebrow">Уровень</p>
                <h2 className="section-title">{level.title}</h2>
                <p className="boosty-level-price">{level.price}</p>
                <p className="muted-text">{level.description}</p>
              </button>
            ))}
          </section>

          <section className="sleek-card boosty-matrix-card">
            <div className="section-header compact-header">
              <div>
                <h2 className="section-title">Доступ по книгам</h2>
                <p className="section-caption">Сейчас выбран уровень: {activeLevel.title}</p>
              </div>
            </div>

            <div className="boosty-book-list">
              {catalog.books.map((book) => {
                const access = getAccessMap(book.id);
                const accessValue = access[selectedLevel];

                return (
                  <article key={book.id} className="boosty-book-card">
                    <div className="boosty-book-head">
                      <div>
                        <p className="book-tile-kicker">{book.author}</p>
                        <div className="title-with-status hero">
                          <h3 className="boosty-book-title">{book.title}</h3>
                          {book.isCompleted ? <span className="status-badge completed hero-status">Завершена</span> : null}
                        </div>
                      </div>
                      <Link to={`/book/${book.id}`} className="tier-link-button boosty-book-link">
                        <span>Открыть книгу</span>
                      </Link>
                    </div>

                    <div className="boosty-access-grid single-level">
                      <div className="boosty-access-row active-row">
                        <span className="boosty-access-label">{activeLevel.title}</span>
                        <span className="boosty-access-value">{accessValue}</span>
                      </div>
                    </div>

                    {access.note ? <p className="boosty-access-note">{access.note}</p> : null}
                  </article>
                );
              })}
            </div>
          </section>

          <BottomDock active="levels" />
        </div>
      </IonContent>
    </IonPage>
  );
}
