import { IonIcon } from '@ionic/react';
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import type { BookSummary } from '../types/content';

interface CompletedShelfProps {
  books: BookSummary[];
}

export function CompletedShelf({ books }: CompletedShelfProps) {
  const { t } = useLanguage();
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateControls = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    updateControls();
    emblaApi.on('reInit', updateControls);
    emblaApi.on('select', updateControls);

    return () => {
      emblaApi.off('reInit', updateControls);
      emblaApi.off('select', updateControls);
    };
  }, [emblaApi, updateControls]);

  if (!books.length) {
    return null;
  }

  return (
    <section className="completed-shelf sleek-card" aria-label={t('home.completedShelfTitle')}>
      <div className="completed-shelf-header">
        <div className="completed-shelf-copy">
          <p className="hero-eyebrow">{t('home.completedShelfEyebrow')}</p>
          <h2 className="section-title">{t('home.completedShelfTitle')}</h2>
          <p className="section-caption completed-shelf-caption">{t('home.completedShelfSubtitle')}</p>
        </div>

        {books.length > 1 ? (
          <div className="completed-shelf-nav" aria-label={t('home.completedShelfTitle')}>
            <button
              type="button"
              className="shelf-nav-button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous"
            >
              <IonIcon icon={arrowBackOutline} />
            </button>
            <button
              type="button"
              className="shelf-nav-button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Next"
            >
              <IonIcon icon={arrowForwardOutline} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="completed-shelf-viewport" ref={viewportRef}>
        <div className="completed-shelf-track">
          {books.map((book, index) => (
            <div key={book.id} className="completed-shelf-slide">
              <Link to={`/book/${book.id}`} className="completed-book-card">
                <motion.div
                  className="completed-book-card-inner"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: index * 0.04 }}
                >
                  <div className="completed-book-cover-wrap">
                    <img className="completed-book-cover" src={book.coverUrl} alt={t('bookCard.coverAlt', { title: book.title })} />
                    <span className="comparison-badge full completed-book-status">{t('common.completed')}</span>
                  </div>

                  <div className="completed-book-copy">
                    <p className="completed-book-author">{book.author}</p>
                    <h3 className="completed-book-title">{book.title}</h3>
                    <p className="completed-book-description">{book.description}</p>

                    <div className="completed-book-tags">
                      {(book.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={`${book.id}-${tag}`} className="completed-book-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
