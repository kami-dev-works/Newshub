import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://newshub.example.com',
  integrations: [react({
    include: ['**/src/**'],
  })],
  output: 'static',
  build: {
    format: 'file',
    assets: 'assets',
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      {
        name: 'spa-fallback',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.method !== 'GET') return next();
            const url = new URL(req.url || '/', 'http://localhost');
            const { pathname } = url;
            if (
              pathname === '/' ||
              pathname.startsWith('/api') ||
              pathname.startsWith('/uploads') ||
              pathname.startsWith('/@') ||
              pathname.startsWith('/__x00__') ||
              pathname.startsWith('/node_modules') ||
              pathname.startsWith('/src') ||
              pathname.startsWith('/favicon') ||
              pathname.includes('.')
            ) return next();
            req.url = '/';
            next();
          });
        },
      },
    ],
  },
  compressHTML: false,
});