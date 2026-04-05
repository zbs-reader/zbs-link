import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { cloudDownloadOutline, openOutline, readerOutline, searchOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { StateView } from '../components/StateView';
import { useLanguage } from '../context/LanguageContext';
import { useBook } from '../hooks/useBook';
import { filesystemService } from '../services/filesystemService';
import { githubService } from '../services/githubService';
import type { AccessTier } from '../types/content';

interface BookRouteParams {
  bookId: string;
}

interface EmbeddedCover {
  id: string;
  contentType: string;
  base64: string;
}

type DownloadFormat = 'md' | 'fb2' | null;

const CHAPTER_BLOCK_SIZE = 100;

function getAvailableChapterMax(accessTiers: AccessTier[]) {
  const freeTier = accessTiers.find((tier) => tier.isFree && tier.chaptersLabel);
  if (!freeTier?.chaptersLabel) {
    return null;
  }

  const match = freeTier.chaptersLabel.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return null;
  }

  return Number(match[2]);
}

function buildSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'book';
}

function buildMarkdownFilename(title: string) {
  return `${buildSlug(title)}.md`;
}

function buildFb2Filename(title: string) {
  return `${buildSlug(title)}.fb2`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_~`>#-]+/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function buildParagraphs(text: string) {
  return stripMarkdown(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n+/g, ' ').trim())
    .filter(Boolean);
}

function buildFb2Paragraphs(text: string) {
  return buildParagraphs(text).map((paragraph) => `<p>${escapeXml(paragraph)}</p>`).join('');
}

function getImageExtension(contentType: string) {
  if (contentType.includes('png')) {
    return 'png';
  }

  if (contentType.includes('webp')) {
    return 'webp';
  }

  if (contentType.includes('gif')) {
    return 'gif';
  }

  return 'jpg';
}

async function fetchCoverAsBase64(url: string): Promise<EmbeddedCover | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const contentType = blob.type || 'image/jpeg';
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const encoded = result.split(',')[1] ?? '';
        resolve(encoded);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

    return {
      id: `cover.${getImageExtension(contentType)}`,
      contentType,
      base64
    };
  } catch {
    return null;
  }
}

function buildFb2Document(params: {
  title: string;
  author: string;
  description: string;
  chapters: Array<{ title: string; content: string }>;
  cover: EmbeddedCover | null;
  language: 'ru' | 'en';
  descriptionSectionTitle: string;
}) {
  const annotation = buildFb2Paragraphs(params.description);
  const descriptionSection = buildParagraphs(params.description)
    .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
    .join('');

  const chapterSections = params.chapters.map((chapter) => {
    const paragraphs = buildParagraphs(chapter.content);
    const filtered = paragraphs[0] === chapter.title ? paragraphs.slice(1) : paragraphs;
    const body = filtered.length
      ? filtered.map((paragraph) => `<p>${escapeXml(paragraph)}</p>`).join('')
      : `<p>${escapeXml(chapter.title)}</p>`;

    return `<section><title><p>${escapeXml(chapter.title)}</p></title>${body}</section>`;
  }).join('');

  const coverPage = params.cover ? `<coverpage><image l:href="#${params.cover.id}"/></coverpage>` : '';
  const coverBinary = params.cover
    ? `<binary id="${params.cover.id}" content-type="${params.cover.contentType}">${params.cover.base64}</binary>`
    : '';
  const now = new Date().toISOString().slice(0, 10);

  return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
      <genre>prose_contemporary</genre>
      <author><nickname>${escapeXml(params.author)}</nickname></author>
      <book-title>${escapeXml(params.title)}</book-title>
      ${coverPage}
      <annotation>${annotation || `<p>${escapeXml(params.description)}</p>`}</annotation>
      <lang>${params.language}</lang>
    </title-info>
    <document-info>
      <author><nickname>ZBS Link</nickname></author>
      <program-used>ZBS Link Reader</program-used>
      <date value="${now}">${now}</date>
      <id>${escapeXml(`${buildSlug(params.title)}-${now}`)}</id>
      <version>1.0</version>
    </document-info>
  </description>
  <body>
    <title><p>${escapeXml(params.title)}</p></title>
    <section>
      <title><p>${escapeXml(params.descriptionSectionTitle)}</p></title>
      ${descriptionSection || `<p>${escapeXml(params.description)}</p>`}
    </section>
    ${chapterSections}
  </body>
  ${coverBinary}
</FictionBook>`;
}

export function BookDetailsPage({ match }: RouteComponentProps<BookRouteParams>) {
  const { bookId } = match.params;
  const { book, loading, error } = useBook(bookId);
  const history = useHistory();
  const { t, language } = useLanguage();
  const [chapterQuery, setChapterQuery] = useState('');
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>(null);
  const chapters = book?.chapters ?? [];
  const accessTiers = book?.accessTiers ?? [];
  const externalLinks = book?.externalLinks ?? [];
  const hasChapters = chapters.length > 0;
  const firstChapter = chapters[0];
  const normalizedChapterQuery = chapterQuery.trim().toLowerCase();
  const availableChapterMax = getAvailableChapterMax(accessTiers);
  const downloadableChapters = availableChapterMax
    ? chapters.filter((chapter) => chapter.order <= availableChapterMax)
    : chapters;
  const isDownloadingMarkdown = downloadFormat === 'md';
  const isDownloadingFb2 = downloadFormat === 'fb2';
  const isBusy = downloadFormat !== null;

  const filteredChapters = useMemo(() => {
    if (!normalizedChapterQuery) {
      return chapters;
    }

    return chapters.filter((chapter) => {
      const haystack = `${chapter.order} ${chapter.title} ${chapter.excerpt ?? ''}`.toLowerCase();
      return haystack.includes(normalizedChapterQuery);
    });
  }, [chapters, normalizedChapterQuery]);

  const chapterGroups = !normalizedChapterQuery && hasChapters
    ? Array.from({ length: Math.ceil(chapters.length / CHAPTER_BLOCK_SIZE) }, (_, index) => {
        const startIndex = index * CHAPTER_BLOCK_SIZE;
        const groupedChapters = chapters.slice(startIndex, startIndex + CHAPTER_BLOCK_SIZE);
        const first = groupedChapters[0]?.order ?? startIndex + 1;
        const last = groupedChapters[groupedChapters.length - 1]?.order ?? first;
        return {
          id: `chapter-group-${index + 1}`,
          label: `${first}-${last}`,
          chapters: groupedChapters
        };
      })
    : [];

  if (loading) {
    return (
      <IonPage>
        <AppHeader title={t('book.bookLabel')} subtitle={t('book.loadingDetails')} backHref="/" />
        <IonContent fullscreen>
          <StateView loading title={t('book.loadingTitle')} message={t('book.loadingMessage')} />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !book) {
    return (
      <IonPage>
        <AppHeader title={t('book.bookLabel')} backHref="/" />
        <IonContent fullscreen>
          <StateView title={t('book.unavailableTitle')} message={error ?? t('book.unavailableMessage')} actionLabel={t('book.backHome')} onAction={() => history.push('/')} />
        </IonContent>
      </IonPage>
    );
  }

  const loadChapterContents = async () => {
    return Promise.all(
      downloadableChapters.map(async (chapter) => ({
        title: chapter.title,
        content: (await githubService.getChapterContent(book.id, chapter.id)).trim()
      }))
    );
  };

  const handleDownloadMarkdown = async () => {
    if (!downloadableChapters.length || isBusy) {
      return;
    }

    setDownloadFormat('md');

    try {
      const contents = await loadChapterContents();
      const compiled = [`# ${book.title}`, '', `${t('book.author')}: ${book.author}`, '']
        .concat(contents.flatMap((chapter) => [chapter.content, '', '---', '']))
        .join('\n')
        .trim();

      filesystemService.downloadTextFile(buildMarkdownFilename(book.title), compiled, 'text/markdown;charset=utf-8');
    } finally {
      setDownloadFormat(null);
    }
  };

  const handleDownloadFb2 = async () => {
    if (!downloadableChapters.length || isBusy) {
      return;
    }

    setDownloadFormat('fb2');

    try {
      const [contents, cover] = await Promise.all([
        loadChapterContents(),
        fetchCoverAsBase64(book.coverUrl)
      ]);

      const fb2 = buildFb2Document({
        title: book.title,
        author: book.author,
        description: book.description,
        chapters: contents,
        cover,
        language,
        descriptionSectionTitle: t('book.descriptionSectionTitle')
      });

      filesystemService.downloadTextFile(buildFb2Filename(book.title), fb2, 'application/x-fictionbook+xml;charset=utf-8');
    } finally {
      setDownloadFormat(null);
    }
  };

  return (
    <IonPage>
      <AppHeader title={book.title} subtitle={book.author} backHref="/" />
      <IonContent fullscreen>
        <div className="page-shell app-shell-stack">
          <section className="detail-spotlight">
            <img className="detail-cover-large" src={book.coverUrl} alt={`${book.title} cover`} />
            <div className="detail-copy">
              <p className="hero-eyebrow">{t('book.featuredStory')}</p>
              <h1 className="hero-title">{book.title}</h1>
              <p className="hero-subtitle">{book.description}</p>
              <div className="meta-pills-row">
                <span className="meta-pill">{book.chapters.length} {t('common.chapters')}</span>
                {accessTiers.length ? <span className="meta-pill">{accessTiers.length} {t('common.levels')}</span> : null}
                {(book.tags ?? []).slice(0, 3).map((tag) => <span key={tag} className="meta-pill">{tag}</span>)}
              </div>
            </div>
          </section>

          <section className="action-panel">
            <IonButton expand="block" routerLink={hasChapters && firstChapter ? `/reader/${book.id}/${firstChapter.id}` : undefined} disabled={!hasChapters || isBusy}>
              <IonIcon slot="start" icon={readerOutline} />
              {hasChapters ? t('book.startReading') : t('book.chaptersSoon')}
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={handleDownloadMarkdown} disabled={!downloadableChapters.length || isBusy}>
              <IonIcon slot="start" icon={cloudDownloadOutline} />
              {isDownloadingMarkdown ? t('book.buildingFile') : t('book.downloadMarkdown')}
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={handleDownloadFb2} disabled={!downloadableChapters.length || isBusy}>
              <IonIcon slot="start" icon={cloudDownloadOutline} />
              {isDownloadingFb2 ? t('book.buildingFb2') : t('book.downloadFb2')}
            </IonButton>
          </section>

          {externalLinks.length ? (
            <section className="platforms-panel sleek-card">
              <div className="section-header compact-header">
                <h2 className="section-title">{t('book.platforms')}</h2>
                <span className="section-caption">{externalLinks.length} {t('common.links')}</span>
              </div>
              <div className="platform-links-grid">
                {externalLinks.map((platform) => (
                  <a key={platform.id} className="platform-link-card" href={platform.url} target="_blank" rel="noreferrer">
                    <span className="platform-link-label">{platform.label}</span>
                    <IonIcon icon={openOutline} />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {accessTiers.length ? (
            <section className="tiers-panel sleek-card">
              <div className="section-header compact-header">
                <h2 className="section-title">{t('book.boosty')}</h2>
                <span className="section-caption">{accessTiers.length} {t('common.levels')}</span>
              </div>
              <div className="tiers-grid-compact">
                {accessTiers.map((tier) => (
                  <article key={tier.id} className={`tier-tile${tier.isFree ? ' tier-tile-free' : ''}`}>
                    <div className="tier-tile-head">
                      <span className={`tier-badge${tier.isFree ? ' tier-badge-free' : ''}`}>{tier.isFree ? 'FREE' : 'LEVEL'}</span>
                      <p className="tier-price-line">{tier.price}</p>
                    </div>
                    <h3 className="tier-title">{tier.title}</h3>
                    <p className="tier-description">{tier.description}</p>
                    {tier.chaptersLabel ? <p className="tier-meta-line">{tier.chaptersLabel}</p> : null}
                    {tier.linkUrl ? (
                      <a className="tier-link-button" href={tier.linkUrl} target="_blank" rel="noreferrer">
                        <IonIcon icon={openOutline} />
                        <span>{tier.linkLabel ?? t('common.open')}</span>
                      </a>
                    ) : (
                      <button type="button" className="tier-link-button muted" disabled>
                        <span>{t('common.soon')}</span>
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="section-header compact-header">
              <h2 className="section-title">{t('common.chapters')}</h2>
              <span className="section-caption">{filteredChapters.length} {t('common.found')}</span>
            </div>
            {hasChapters ? (
              <>
                <div className="chapter-search-shell">
                  <div className="chapter-search-input-wrap">
                    <IonIcon icon={searchOutline} className="search-leading-icon" />
                    <input
                      id="chapter-search"
                      name="chapter-search"
                      value={chapterQuery}
                      onChange={(event) => setChapterQuery(event.target.value)}
                      className="search-input"
                      placeholder={t('book.searchPlaceholder')}
                    />
                  </div>
                </div>

                {normalizedChapterQuery ? (
                  filteredChapters.length ? (
                    <div className="chapter-list sleek-list grouped flat-results">
                      {filteredChapters.map((chapter) => (
                        <Link key={chapter.id} to={`/reader/${book.id}/${chapter.id}`} className="chapter-card sleek-card compact">
                          <div>
                            <p className="chapter-title">{chapter.title}</p>
                            <p className="chapter-subtitle">{chapter.excerpt ?? `${t('common.chapter')} ${chapter.order}`}</p>
                          </div>
                          <IonIcon icon={readerOutline} color="primary" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="sleek-card chapter-card">
                      <div>
                        <p className="chapter-title">{t('book.nothingFoundTitle')}</p>
                        <p className="chapter-subtitle">{t('book.nothingFoundSubtitle')}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="chapter-groups-list">
                    {chapterGroups.map((group, index) => (
                      <details key={group.id} className="chapter-group-card sleek-card" open={index === 0}>
                        <summary className="chapter-group-summary">
                          <div>
                            <p className="chapter-group-title">{t('book.groupTitle', { range: group.label })}</p>
                            <p className="chapter-group-subtitle">{group.chapters.length} {t('book.inBlock')}</p>
                          </div>
                        </summary>
                        <div className="chapter-list sleek-list grouped">
                          {group.chapters.map((chapter) => (
                            <Link key={chapter.id} to={`/reader/${book.id}/${chapter.id}`} className="chapter-card sleek-card compact">
                              <div>
                                <p className="chapter-title">{chapter.title}</p>
                                <p className="chapter-subtitle">{chapter.excerpt ?? `${t('common.chapter')} ${chapter.order}`}</p>
                              </div>
                              <IonIcon icon={readerOutline} color="primary" />
                            </Link>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="sleek-card chapter-card">
                <div>
                  <p className="chapter-title">{t('book.chaptersNotAddedTitle')}</p>
                  <p className="chapter-subtitle">{t('book.chaptersNotAddedSubtitle')}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}