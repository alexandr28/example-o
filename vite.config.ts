// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_BASE_URL = env.VITE_API_URL || 'http://192.168.20.160:8080';
  
  console.log('🔧 Configurando Vite con API_BASE_URL:', API_BASE_URL);
  
  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      hmr: { 
        overlay: true,
        clientPort: 3000,
      },
      
      proxy: {
        // Proxy para autenticación
        '/auth': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🔐 AUTH PROXY: ${req.method} ${req.url} -> ${API_BASE_URL}${req.url}`);
            });
          }
        },
        
        // Proxy para todas las APIs
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`📤 API PROXY: ${req.method} ${req.url} -> ${API_BASE_URL}${req.url}`);
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`📥 API PROXY RESPONSE: ${proxyRes.statusCode} for ${req.url}`);
            });
            
            proxy.on('error', (err, req, res) => {
              console.error(`❌ API PROXY ERROR for ${req.url}:`, err.message);
              
              if (!res.headersSent) {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({
                  error: 'Proxy Error',
                  message: `No se pudo conectar con ${API_BASE_URL}${req.url}`,
                  details: err.message
                }));
              }
            });
          }
        }
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production'
    },
    
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom'
      ]
    }
  };
});