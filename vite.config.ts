import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = '/zbs-link/';

export default defineConfig({
  base: repoBase,
  plugins: [
    react(),
    {
      name: 'copy-index-to-404',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist');
        const indexPath = resolve(distDir, 'index.html');
        const notFoundPath = resolve(distDir, '404.html');

        if (existsSync(indexPath)) {
          cpSync(indexPath, notFoundPath);
        }
      }
    }
  ],
  server: {
    host: true,
    port: 5173
  }
});