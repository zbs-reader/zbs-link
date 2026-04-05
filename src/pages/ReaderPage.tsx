import { useEffect, useRef, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, optionsOutline } from 'ionicons/icons';
import ReactMarkdown from 'react-markdown';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useReader } from '../hooks/useReader';

interface ReaderRouteParams {
  bookId: string;
  chapterId: string;
}

type ReaderFont = 'sans' | 'serif' | 'mono';
type ReaderSize = 'sm' | 'md' | 'lg';
type ReaderTone = 'theme' | 'sepia' | 'contrast';

interface ReaderSettings {
  font: ReaderFont;
  size: ReaderSize;
  tone: ReaderTone;
}

const READER_SETTINGS_KEY = 'zbs-link-reader-settings';
const defaultReaderSettings: ReaderSettings = {
  font: 'sans',
  size: 'md',
  tone: 'theme'
};

function getInitialReaderSettings(): ReaderSettings {
  if (typeof window === 'undefined') {
    return defaultReaderSettings;
  }

  try {
    const raw = window.localStorage.getItem(READER_SETTINGS_KEY);
    if (!raw) {
      return defaultReaderSettings;
    }

    return { ...defaultReaderSettings, ...(JSON.parse(raw) as Partial<ReaderSettings>) };
  } catch {
    return defaultReaderSettings;
  }
}

export function ReaderPage({ match }: RouteComponentProps<ReaderRouteParams>) {
  const { bookId, chapterId } = match.params;
  const history = useHistory();
  const { t } = useLanguage();
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSavedPositionRef = useRef(0);
  const [readingPercent, setReadingPercent] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(getInitialReaderSettings);
  const { book, chapterContent, progress, loading, error, saveProgress } = useReader(bookId, chapterId);

  useEffect(() => {
    window.localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(readerSettings));
  }, [readerSettings]);

  useEffect(() => {
    const ionContent = contentRef.current;
    if (!ionContent || !progress || progress.chapterId !== chapterId) {
      return;
    }

    lastSavedPositionRef.current = progress.scrollPosition;
    void ionContent.scrollToPoint(0, progress.scrollPosition, 0);
  }, [chapterId, progress]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const scheduleProgressSave = (scrollPosition: number) => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      if (Math.abs(scrollPosition - lastSavedPositionRef.current) < 24) {
        return;
      }

      lastSavedPositionRef.current = scrollPosition;
      void saveProgress(scrollPosition);
    }, 220);
  };

  const handleReaderScroll = (event: CustomEvent) => {
    const detail = event.detail as { scrollTop: number; scrollHeight: number };
    const current = detail.scrollTop ?? 0;
    const available = Math.max((detail.scrollHeight ?? 0) - window.innerHeight, 1);
    const nextPercent = Math.max(0, Math.min(100, (current / available) * 100));

    setReadingPercent((prev) => (Math.abs(prev - nextPercent) > 0.5 ? nextPercent : prev));
    scheduleProgressSave(current);
  };

  const updateReaderSettings = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setReaderSettings((current) => ({ ...current, [key]: value }));
  };

  const headerActions = (
    <div className="reader-header-actions">
      <button type="button" className={`reader-header-button${showSettings ? ' active' : ''}`} onClick={() => setShowSettings((current) => !current)} aria-label={t('reader.readerSettings')}>
        <IonIcon icon={optionsOutline} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <IonPage>
        <AppHeader className="reader-header" title={t('reader.openChapterTitle')} showBrandMeta />
        <IonContent fullscreen className="reader-page">
          <StateView loading title={t('reader.openingChapter')} message={t('reader.openingMessage')} />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !book) {
    return (
      <IonPage>
        <AppHeader className="reader-header" title={t('reader.readerTitle')} showBrandMeta />
        <IonContent fullscreen className="reader-page">
          <StateView title={t('reader.unavailableTitle')} message={error ?? t('reader.unavailableMessage')} actionLabel={t('reader.backToDetails')} onAction={() => history.push(`/book/${bookId}`)} />
        </IonContent>
      </IonPage>
    );
  }

  const activeChapterIndex = book.chapters.findIndex((chapter) => chapter.id === chapterId);
  const activeChapter = activeChapterIndex >= 0 ? book.chapters[activeChapterIndex] : null;
  const previousChapter = activeChapterIndex > 0 ? book.chapters[activeChapterIndex - 1] : null;
  const nextChapter = activeChapterIndex >= 0 && activeChapterIndex < book.chapters.length - 1 ? book.chapters[activeChapterIndex + 1] : null;
  const chapterLabel = activeChapter ? t('reader.volumeChapterLabel', { order: activeChapter.order }) : t('reader.chapterLabel');

  const chapterSwitcher = (
    <div className="reader-chapter-switcher">
      <button type="button" className="reader-nav-button" onClick={() => previousChapter && history.push(`/reader/${bookId}/${previousChapter.id}`)} disabled={!previousChapter} aria-label={t('reader.previousChapter')}>
        <IonIcon icon={chevronBackOutline} />
      </button>
      <div className="reader-chapter-pill">{chapterLabel}</div>
      <button type="button" className="reader-nav-button" onClick={() => nextChapter && history.push(`/reader/${bookId}/${nextChapter.id}`)} disabled={!nextChapter} aria-label={t('reader.nextChapter')}>
        <IonIcon icon={chevronForwardOutline} />
      </button>
    </div>
  );

  return (
    <IonPage>
      <AppHeader className="reader-header" title={book.title} subtitle={chapterLabel} showBrandMeta centerContent={chapterSwitcher} endContent={headerActions} />
      <IonContent ref={contentRef} fullscreen scrollEvents className="reader-page" onIonScroll={handleReaderScroll}>
        <div className={`reader-layout reader-layout-with-header reader-font-${readerSettings.font} reader-size-${readerSettings.size} reader-tone-${readerSettings.tone}`}>
          {showSettings ? (
            <section className="reader-settings-panel sleek-card">
              <div className="reader-settings-group">
                <p className="reader-settings-label">{t('reader.font')}</p>
                <div className="reader-settings-options">
                  <button type="button" className={`reader-settings-chip${readerSettings.font === 'sans' ? ' active' : ''}`} onClick={() => updateReaderSettings('font', 'sans')}>Sans</button>
                  <button type="button" className={`reader-settings-chip${readerSettings.font === 'serif' ? ' active' : ''}`} onClick={() => updateReaderSettings('font', 'serif')}>Serif</button>
                  <button type="button" className={`reader-settings-chip${readerSettings.font === 'mono' ? ' active' : ''}`} onClick={() => updateReaderSettings('font', 'mono')}>Mono</button>
                </div>
              </div>

              <div className="reader-settings-group">
                <p className="reader-settings-label">{t('reader.size')}</p>
                <div className="reader-settings-options">
                  <button type="button" className={`reader-settings-chip${readerSettings.size === 'sm' ? ' active' : ''}`} onClick={() => updateReaderSettings('size', 'sm')}>S</button>
                  <button type="button" className={`reader-settings-chip${readerSettings.size === 'md' ? ' active' : ''}`} onClick={() => updateReaderSettings('size', 'md')}>M</button>
                  <button type="button" className={`reader-settings-chip${readerSettings.size === 'lg' ? ' active' : ''}`} onClick={() => updateReaderSettings('size', 'lg')}>L</button>
                </div>
              </div>

              <div className="reader-settings-group">
                <p className="reader-settings-label">{t('reader.tone')}</p>
                <div className="reader-settings-options">
                  <button type="button" className={`reader-settings-chip${readerSettings.tone === 'theme' ? ' active' : ''}`} onClick={() => updateReaderSettings('tone', 'theme')}>{t('reader.themeTone')}</button>
                  <button type="button" className={`reader-settings-chip${readerSettings.tone === 'sepia' ? ' active' : ''}`} onClick={() => updateReaderSettings('tone', 'sepia')}>{t('reader.sepiaTone')}</button>
                  <button type="button" className={`reader-settings-chip${readerSettings.tone === 'contrast' ? ' active' : ''}`} onClick={() => updateReaderSettings('tone', 'contrast')}>{t('reader.contrastTone')}</button>
                </div>
              </div>
            </section>
          ) : null}

          <header className="reader-heading">
            <h1 className="reader-heading-title">{chapterLabel}{activeChapter ? ` - ${activeChapter.title}` : ''}</h1>
            {activeChapter?.excerpt ? <p className="reader-heading-subtitle">{activeChapter.excerpt}</p> : null}
          </header>

          <article className="reader-content reader-content-flat">
            <ReactMarkdown>{chapterContent}</ReactMarkdown>
          </article>

          <div className="reader-progress-inline">
            <div className="reader-progress-track">
              <div className="reader-progress-current" style={{ width: `${readingPercent}%` }} />
            </div>
            <span className="reader-progress-value">{Math.round(readingPercent)}%</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}