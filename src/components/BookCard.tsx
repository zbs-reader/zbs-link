import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import type { BookSummary } from '../types/content';

interface BookCardProps {
  book: BookSummary;
}

export function BookCard({ book }: BookCardProps) {
  const { t } = useLanguage();
  const flavor = book.tags?.[0] ?? t('bookCard.catalogTag');
  const meta = t('bookCard.novelMeta', { tag: flavor });

  return (
    <Link to={`/book/${book.id}`} className="book-tile-card">
      <div className="book-tile-cover-wrap">
        <img className="book-tile-cover" src={book.coverUrl} alt={t('bookCard.coverAlt', { title: book.title })} />
        <div className="book-tile-cover-overlay" />
        <div className="book-tile-floating-meta">
          <span className="book-tile-chip">{flavor}</span>
          {book.isCompleted ? <span className="status-badge completed cover-status">{t('common.completed')}</span> : null}
        </div>
      </div>
      <div className="book-tile-meta">
        <p className="book-tile-kicker">{book.author}</p>
        <h3 className="book-tile-title">{book.title}</h3>
        <p className="book-tile-summary">{meta}</p>
      </div>
    </Link>
  );
}
