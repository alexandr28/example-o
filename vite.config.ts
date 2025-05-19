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
        rewrite:(path) => path.replace(/^\/api/, ''),
     secure: false,
        ws: true,
        // Configuración adicional para manejo de CORS
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Error del proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});