import { defineConfig } from 'vite';

export default defineConfig({
  build: { target: 'esnext' },
  server: { proxy: { '/api': 'http://localhost:3001' } },
  worker: { format: 'es' },
});
