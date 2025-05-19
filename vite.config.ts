// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // redirige las peticiones a /api hacia tu backend en localhost:8089
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite:(path) => path.replace(/^\/api/, '')
      }
    }
  }
});