import { IonIcon } from '@ionic/react';
import { arrowForwardOutline, layersOutline } from 'ionicons/icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import type { BookSummary, CollectionBanner as CollectionBannerType } from '../types/content';
import { getCollectionPreviewBooks } from '../utils/collections';

interface CollectionBannerProps {
  banner: CollectionBannerType;
  books: BookSummary[];
  variant?: 'hero' | 'compact';
}

export function CollectionBanner({ banner, books, variant = 'hero' }: CollectionBannerProps) {
  const { t } = useLanguage();
  const previewBooks = getCollectionPreviewBooks(banner, books, 3);
  const totalBooks = banner.bookIds.length;

  return (
    <Link to={`/collections/${banner.id}`} className={`collection-banner-card ${variant}`} aria-label={banner.title}>
      <motion.div
        className="collection-banner-motion"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        whileHover={{ y: -4 }}
      >
        {banner.backgroundUrl ? (
          <div className="collection-banner-bg" style={{ backgroundImage: `url(${banner.backgroundUrl})` }} />
        ) : null}
        <div className="collection-banner-aurora" />
        <div className="collection-banner-noise" />

        <div className="collection-banner-inner">
          <div className="collection-banner-copy">
            <p className="collection-banner-kicker">{banner.label ?? t('collections.defaultLabel')}</p>
            <h2 className="collection-banner-title">{banner.title}</h2>
            <p className="collection-banner-subtitle">{banner.subtitle ?? banner.description ?? t('collections.defaultSubtitle')}</p>

            <div className="collection-banner-meta">
              <span className="collection-banner-meta-chip">
                <IonIcon icon={layersOutline} />
                <span>{t('collections.booksCount', { count: totalBooks })}</span>
              </span>
            </div>

            <div className="collection-banner-cta">
              <span>{t('collections.openCollection')}</span>
              <IonIcon icon={arrowForwardOutline} />
            </div>
          </div>

          <div className="collection-banner-books" aria-hidden="true">
            {previewBooks.map((book, index) => (
              <div
                key={`${banner.id}-${book.id}`}
                className={`collection-book-stand collection-book-${index + 1}`}
                style={{ ['--book-order' as string]: String(index) }}
              >
                <div className="collection-book-depth" />
                <img className="collection-book-cover" src={book.coverUrl} alt="" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
