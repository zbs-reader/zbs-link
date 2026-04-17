import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    base: './',
    plugins: [
        react(),
        {
            name: 'copy-index-to-404',
            closeBundle: function () {
                var distDir = resolve(__dirname, 'dist');
                var indexPath = resolve(distDir, 'index.html');
                var notFoundPath = resolve(distDir, '404.html');
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
