import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { StateView } from '../components/StateView';
import { useCatalog } from '../hooks/useCatalog';
import type { AccessTier, BookSummary, Catalog, ExternalPlatformLink } from '../types/content';

interface EditableLink extends ExternalPlatformLink {}
interface EditableTier extends AccessTier {}

const defaultLinks = (): EditableLink[] => ([
  { id: 'rulate', label: 'Rulate', url: '' },
  { id: 'ranobelib', label: 'RanobeLIB', url: '' }
]);

const defaultTiers = (): EditableTier[] => ([
  {
    id: 'free',
    title: 'FREE',
    price: '0 ₽',
    description: 'Открытые главы без подписки.',
    chaptersLabel: '',
    linkUrl: '',
    linkLabel: 'Открыть на Boosty',
    isFree: true
  }
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AdminPage() {
  const { catalog, loading, error } = useCatalog();
  const [workingCatalog, setWorkingCatalog] = useState<Catalog | null>(null);
  const [title, setTitle] = useState('');
  const [bookId, setBookId] = useState('');
  const [author, setAuthor] = useState('Команда ZBS Link');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [links, setLinks] = useState<EditableLink[]>(defaultLinks);
  const [tiers, setTiers] = useState<EditableTier[]>(defaultTiers);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (catalog && !workingCatalog) {
      setWorkingCatalog(catalog);
    }
  }, [catalog, workingCatalog]);

  useEffect(() => {
    if (!title) {
      return;
    }

    setBookId((current) => (current.trim().length ? current : slugify(title)));
  }, [title]);

  const previewBook = useMemo<BookSummary>(() => ({
    id: bookId.trim(),
    title: title.trim(),
    author: author.trim() || 'Команда ZBS Link',
    description: description.trim(),
    coverUrl: coverUrl.trim(),
    chapters: [],
    tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    externalLinks: links.filter((link) => link.label.trim() && link.url.trim()),
    accessTiers: tiers.filter((tier) => tier.title.trim()).map((tier) => ({
      ...tier,
      id: tier.id.trim() || slugify(tier.title),
      title: tier.title.trim(),
      price: tier.price.trim(),
      description: tier.description.trim(),
      chaptersLabel: tier.chaptersLabel?.trim() || undefined,
      linkUrl: tier.linkUrl?.trim() || undefined,
      linkLabel: tier.linkLabel?.trim() || undefined,
      isFree: Boolean(tier.isFree)
    })),
    isCompleted
  }), [author, bookId, coverUrl, description, isCompleted, links, tags, tiers, title]);

  if (loading) {
    return (
      <IonPage>
        <AppHeader title="Админ JSON" subtitle="Подгружаю текущий каталог" />
        <IonContent fullscreen>
          <StateView loading title="Загружаю каталог" message="Собираю текущий public/catalog.json для редактирования." />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !workingCatalog) {
    return (
      <IonPage>
        <AppHeader title="Админ JSON" />
        <IonContent fullscreen>
          <StateView title="Каталог недоступен" message={error ?? 'Не удалось открыть public/catalog.json.'} />
        </IonContent>
      </IonPage>
    );
  }

  function updateLink(index: number, key: keyof EditableLink, value: string) {
    setLinks((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function updateTier(index: number, key: keyof EditableTier, value: string | boolean) {
    setTiers((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function addLinkRow() {
    setLinks((current) => [...current, { id: `link-${current.length + 1}`, label: '', url: '' }]);
  }

  function addTierRow() {
    setTiers((current) => [...current, {
      id: `tier-${current.length + 1}`,
      title: '',
      price: '',
      description: '',
      chaptersLabel: '',
      linkUrl: '',
      linkLabel: 'Открыть на Boosty',
      isFree: false
    }]);
  }

  function addBookToCatalog() {
    if (!previewBook.id || !previewBook.title || !previewBook.description || !previewBook.coverUrl) {
      setNotice('Заполните id, название, описание и обложку.');
      return;
    }

    setWorkingCatalog((current) => {
      if (!current) {
        return current;
      }

      const exists = current.books.some((book) => book.id === previewBook.id);
      const books = exists
        ? current.books.map((book) => (book.id === previewBook.id ? previewBook : book))
        : [...current.books, previewBook];

      return { books };
    });

    setNotice('Книга добавлена в рабочий каталог. Теперь можно скачать обновлённый JSON.');
  }

  function downloadCatalog() {
    const content = JSON.stringify(workingCatalog, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catalog.json';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Файл catalog.json скачан.');
  }

  return (
    <IonPage>
      <AppHeader title="Админ JSON" subtitle="Форма добавления книги в public/catalog.json" />
      <IonContent fullscreen>
        <div className="page-shell app-shell-stack">
          <section className="sleek-card admin-panel-card">
            <div className="section-header compact-header">
              <div>
                <h2 className="section-title">Новая книга</h2>
                <p className="section-caption">Заполняете форму, добавляете книгу в рабочий каталог и скачиваете готовый JSON.</p>
              </div>
            </div>

            <div className="admin-grid two-col">
              <label className="admin-field">
                <span>Название</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Новая книга" />
              </label>
              <label className="admin-field">
                <span>ID</span>
                <input value={bookId} onChange={(event) => setBookId(event.target.value)} placeholder="new-book-id" />
              </label>
              <label className="admin-field">
                <span>Автор</span>
                <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Команда ZBS Link" />
              </label>
              <label className="admin-field">
                <span>Обложка</span>
                <input value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="https://..." />
              </label>
            </div>

            <label className="admin-field">
              <span>Описание</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Описание книги" />
            </label>

            <div className="admin-grid two-col">
              <label className="admin-field">
                <span>Теги через запятую</span>
                <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="мистика, ужасы, викторианская эпоха" />
              </label>
              <label className="admin-field checkbox-field">
                <span>Статус</span>
                <div className="admin-checkbox-row">
                  <input type="checkbox" checked={isCompleted} onChange={(event) => setIsCompleted(event.target.checked)} />
                  <span>Книга завершена</span>
                </div>
              </label>
            </div>
          </section>

          <section className="sleek-card admin-panel-card">
            <div className="section-header compact-header">
              <h2 className="section-title">Платформы</h2>
              <button type="button" className="section-link-button" onClick={addLinkRow}>Добавить ссылку</button>
            </div>
            <div className="admin-list">
              {links.map((link, index) => (
                <div key={`${link.id}-${index}`} className="admin-grid three-col">
                  <label className="admin-field">
                    <span>Label</span>
                    <input value={link.label} onChange={(event) => updateLink(index, 'label', event.target.value)} placeholder="Rulate" />
                  </label>
                  <label className="admin-field">
                    <span>ID</span>
                    <input value={link.id} onChange={(event) => updateLink(index, 'id', event.target.value)} placeholder="rulate" />
                  </label>
                  <label className="admin-field">
                    <span>URL</span>
                    <input value={link.url} onChange={(event) => updateLink(index, 'url', event.target.value)} placeholder="https://..." />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="sleek-card admin-panel-card">
            <div className="section-header compact-header">
              <h2 className="section-title">Уровни доступа</h2>
              <button type="button" className="section-link-button" onClick={addTierRow}>Добавить уровень</button>
            </div>
            <div className="admin-list">
              {tiers.map((tier, index) => (
                <div key={`${tier.id}-${index}`} className="admin-tier-card">
                  <div className="admin-grid three-col">
                    <label className="admin-field">
                      <span>Название</span>
                      <input value={tier.title} onChange={(event) => updateTier(index, 'title', event.target.value)} placeholder="FREE" />
                    </label>
                    <label className="admin-field">
                      <span>ID</span>
                      <input value={tier.id} onChange={(event) => updateTier(index, 'id', event.target.value)} placeholder="free-1-225" />
                    </label>
                    <label className="admin-field">
                      <span>Цена</span>
                      <input value={tier.price} onChange={(event) => updateTier(index, 'price', event.target.value)} placeholder="0 ₽" />
                    </label>
                  </div>
                  <div className="admin-grid three-col">
                    <label className="admin-field">
                      <span>Диапазон глав</span>
                      <input value={tier.chaptersLabel ?? ''} onChange={(event) => updateTier(index, 'chaptersLabel', event.target.value)} placeholder="1-225" />
                    </label>
                    <label className="admin-field">
                      <span>Ссылка</span>
                      <input value={tier.linkUrl ?? ''} onChange={(event) => updateTier(index, 'linkUrl', event.target.value)} placeholder="https://boosty.to/..." />
                    </label>
                    <label className="admin-field checkbox-field">
                      <span>Тип</span>
                      <div className="admin-checkbox-row">
                        <input type="checkbox" checked={Boolean(tier.isFree)} onChange={(event) => updateTier(index, 'isFree', event.target.checked)} />
                        <span>FREE уровень</span>
                      </div>
                    </label>
                  </div>
                  <label className="admin-field">
                    <span>Описание</span>
                    <textarea value={tier.description} onChange={(event) => updateTier(index, 'description', event.target.value)} rows={3} placeholder="Описание доступа" />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="sleek-card admin-panel-card">
            <div className="section-header compact-header">
              <div>
                <h2 className="section-title">Действия</h2>
                <p className="section-caption">Сейчас в рабочем каталоге: {workingCatalog.books.length} книг</p>
              </div>
            </div>
            <div className="admin-actions-row">
              <button type="button" className="tier-link-button admin-action-button" onClick={addBookToCatalog}>
                <span>Добавить книгу в каталог</span>
              </button>
              <button type="button" className="tier-link-button admin-action-button" onClick={downloadCatalog}>
                <span>Скачать catalog.json</span>
              </button>
            </div>
            {notice ? <p className="boosty-access-note">{notice}</p> : null}
          </section>

          <section className="sleek-card admin-panel-card">
            <div className="section-header compact-header">
              <h2 className="section-title">Предпросмотр записи</h2>
            </div>
            <pre className="admin-json-preview">{JSON.stringify(previewBook, null, 2)}</pre>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}
