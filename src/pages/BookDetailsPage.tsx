import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { openOutline } from 'ionicons/icons';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
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
  const { t, language } = useLanguage();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const collapsedDescription = useMemo(() => {
    if (!book?.description) {
      return '';
    }

    if (book.description.length <= 320) {
      return book.description;
    }

    return `${book.description.slice(0, 320).trimEnd()}…`;
  }, [book?.description]);

  const platformLinks = useMemo(() => {
    if (!book) {
      return [];
    }

    const links = [...(book.externalLinks ?? [])];
    if (
      book.boostyBundleUrl &&
      !links.some(
        (platform) =>
          platform.url === book.boostyBundleUrl ||
          platform.id === 'boosty-bundle'
      )
    ) {
      links.unshift({
        id: 'boosty-bundle',
        label: 'Boosty bundle',
        url: book.boostyBundleUrl
      });
    }

    return links;
  }, [book]);

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

  const descriptionText = descriptionExpanded ? book.description : collapsedDescription;
  const canExpandDescription = book.description.length > collapsedDescription.length;
  const tierCount = book.accessTiers?.length ?? 0;
  const paidTierCount = book.accessTiers?.filter((tier) => !tier.isFree).length ?? 0;

  return (
    <IonPage>
      <AppHeader title={book.title} subtitle={book.author} />
      <IonContent fullscreen>
        <div className="page-shell app-shell-stack detail-layout">
          <motion.section
            className="book-hero-panel sleek-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34 }}
          >
            <div className="book-hero-grid">
              <div className="book-hero-cover-panel">
                <img className="detail-cover-large product" src={book.coverUrl} alt={`${book.title} cover`} />
                <div className="book-hero-surface">
                  <span className="book-hero-surface-label">{book.author}</span>
                  {(book.tags ?? []).slice(0, 2).map((tag) => (
                    <span key={tag} className="book-hero-surface-pill">{tag}</span>
                  ))}
                  {book.isCompleted ? <span className="status-badge completed">Завершена</span> : null}
                </div>
              </div>

              <div className="book-hero-main">
                <p className="hero-eyebrow">{t('book.featuredStory')}</p>
                <h1 className="hero-title product">{book.title}</h1>
                <p className="hero-subtitle editorial">{book.author}</p>

                <div className="book-hero-meta-grid">
                  <div className="book-hero-metric">
                    <span className="book-hero-metric-value">{tierCount}</span>
                    <span className="book-hero-metric-label">{t('common.levels')}</span>
                  </div>
                  <div className="book-hero-metric">
                    <span className="book-hero-metric-value">{paidTierCount}</span>
                    <span className="book-hero-metric-label">Paid tiers</span>
                  </div>
                  <div className="book-hero-metric">
                    <span className="book-hero-metric-value">{platformLinks.length}</span>
                    <span className="book-hero-metric-label">{t('common.links')}</span>
                  </div>
                </div>

                <div className="book-description-card">
                  <div className="section-header compact-header">
                    <h2 className="section-title">{t('book.descriptionSectionTitle')}</h2>
                    {canExpandDescription ? (
                      <button type="button" className="section-link-button" onClick={() => setDescriptionExpanded((current) => !current)}>
                        {descriptionExpanded ? (language === 'ru' ? 'Свернуть' : 'Collapse') : (language === 'ru' ? 'Полностью' : 'Expand')}
                      </button>
                    ) : null}
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={descriptionExpanded ? 'expanded' : 'collapsed'}
                      className="book-description-copy"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      {descriptionText}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="meta-pills-row compact">
                  {(book.tags ?? []).map((tag) => <span key={tag} className="meta-pill">{tag}</span>)}
                </div>
              </div>
            </div>
          </motion.section>

          {platformLinks.length ? (
            <motion.section
              className="platforms-panel sleek-card product"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28 }}
            >
              <div className="section-header compact-header">
                <h2 className="section-title">{t('book.platforms')}</h2>
                <span className="section-caption">{platformLinks.length} {t('common.links')}</span>
              </div>
              <div className="platform-links-grid compact-row-grid">
                {platformLinks.map((platform) => (
                  <a key={platform.id} className="platform-link-card compact" href={platform.url} target="_blank" rel="noreferrer">
                    <div>
                      <span className="platform-link-label">{platform.label}</span>
                      <p className="section-caption">{platform.id === 'boosty-bundle' ? 'Open bundle' : 'Open profile'}</p>
                    </div>
                    <IonIcon icon={openOutline} />
                  </a>
                ))}
              </div>
            </motion.section>
          ) : null}

          {book.accessTiers?.length ? (
            <motion.section
              className="tiers-panel sleek-card compare-panel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.28 }}
            >
              <div className="section-header compact-header">
                <div>
                  <h2 className="section-title">{t('book.boosty')}</h2>
                  <p className="section-caption">Уровни доступа и диапазоны глав</p>
                </div>
                <span className="section-caption">{book.accessTiers.length} {t('common.levels')}</span>
              </div>
              <div className="tiers-compare-list">
                {book.accessTiers.map((tier, index) => {
                  const isFull = tier.title.toLowerCase().includes('полная') || tier.chaptersLabel?.toLowerCase().includes('полностью');
                  return (
                    <motion.article
                      key={tier.id}
                      className={`tier-compare-card ${tier.isFree ? 'is-free' : ''} ${isFull ? 'is-full' : ''}`}
                      initial={{ opacity: 0, x: 14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                    >
                      <div className="tier-compare-side">
                        <span className={`tier-badge${tier.isFree ? ' tier-badge-free' : ''}`}>{tier.isFree ? 'FREE' : isFull ? 'FULL' : 'LEVEL'}</span>
                        <h3 className="tier-title">{tier.title}</h3>
                        <p className="tier-description">{tier.description}</p>
                      </div>
                      <div className="tier-compare-meta">
                        <div>
                          <p className="tier-compare-label">Цена</p>
                          <p className="tier-compare-value">{tier.price}</p>
                        </div>
                        <div>
                          <p className="tier-compare-label">Главы</p>
                          <p className="tier-compare-value">{tier.chaptersLabel ?? t('common.soon')}</p>
                        </div>
                      </div>
                      {tier.linkUrl ? (
                        <a className="tier-link-button compare" href={tier.linkUrl} target="_blank" rel="noreferrer">
                          <IonIcon icon={openOutline} />
                          <span>{tier.linkLabel ?? t('common.open')}</span>
                        </a>
                      ) : (
                        <button type="button" className="tier-link-button muted compare" disabled>
                          <span>{t('common.soon')}</span>
                        </button>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            </motion.section>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
}
