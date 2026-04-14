import { IonIcon } from '@ionic/react';
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import type { BookSummary } from '../types/content';

interface FeaturedShelfProps {
  books: BookSummary[];
}

export function FeaturedShelf({ books }: FeaturedShelfProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps'
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { t } = useLanguage();

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
    emblaApi.on('select', updateControls);
    emblaApi.on('reInit', updateControls);

    return () => {
      emblaApi.off('select', updateControls);
      emblaApi.off('reInit', updateControls);
    };
  }, [emblaApi, updateControls]);

  if (!books.length) {
    return null;
  }

  return (
    <section className="featured-shelf sleek-card">
      <div className="section-header compact-header">
        <div>
          <p className="hero-eyebrow">Featured shelf</p>
          <h2 className="section-title">Подборка на вечер</h2>
        </div>
        <div className="featured-shelf-controls">
          <button
            type="button"
            className="icon-circle-button compact"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label={t('reader.previousChapter')}
          >
            <IonIcon icon={arrowBackOutline} />
          </button>
          <button
            type="button"
            className="icon-circle-button compact"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label={t('reader.nextChapter')}
          >
            <IonIcon icon={arrowForwardOutline} />
          </button>
        </div>
      </div>

      <div className="featured-shelf-viewport" ref={emblaRef}>
        <div className="featured-shelf-track">
          {books.map((book, index) => (
            <div key={book.id} className="featured-shelf-slide">
              <motion.div
                className="featured-spotlight-card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Link to={`/book/${book.id}`} className="featured-spotlight-link">
                  <div className="featured-spotlight-cover-wrap">
                    <img className="featured-spotlight-cover" src={book.coverUrl} alt={t('bookCard.coverAlt', { title: book.title })} />
                    <div className="featured-spotlight-shadow" />
                    <div className="featured-spotlight-copy">
                      <p className="featured-spotlight-author">{book.author}</p>
                      <h3 className="featured-spotlight-title">{book.title}</h3>
                      <p className="featured-spotlight-subtitle">
                        {(book.tags ?? []).slice(0, 2).join(' • ') || t('bookCard.catalogTag')}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
