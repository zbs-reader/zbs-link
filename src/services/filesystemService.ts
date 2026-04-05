import { Directory, Filesystem } from '@capacitor/filesystem';

const APP_ROOT = 'zbs-link-reader';

export const filesystemService = {
  getBookDirectory(bookId: string) {
    return `${APP_ROOT}/books/${bookId}`;
  },

  getCoverPath(bookId: string) {
    return `${this.getBookDirectory(bookId)}/cover`;
  },

  getChapterPath(bookId: string, chapterId: string) {
    return `${this.getBookDirectory(bookId)}/chapters/${chapterId}.md`;
  },

  async hasDownloadedChapter(bookId: string, chapterId: string) {
    try {
      await Filesystem.stat({
        directory: Directory.Data,
        path: this.getChapterPath(bookId, chapterId)
      });
      return true;
    } catch {
      return false;
    }
  },

  async readDownloadedChapter(bookId: string, chapterId: string) {
    const result = await Filesystem.readFile({
      directory: Directory.Data,
      path: this.getChapterPath(bookId, chapterId)
    });

    return typeof result.data === 'string' ? result.data : '';
  },

  async readLocalFirstChapter(bookId: string, chapterId: string, remoteLoader: () => Promise<string>) {
    const hasLocal = await this.hasDownloadedChapter(bookId, chapterId);
    if (hasLocal) {
      return this.readDownloadedChapter(bookId, chapterId);
    }

    return remoteLoader();
  },

  downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
};