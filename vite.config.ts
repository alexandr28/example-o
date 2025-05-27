// vite.config.ts - PROXY DE AUTENTICACIÓN CORREGIDO
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
        // 🔐 PROXY PARA AUTENTICACIÓN - CORREGIDO Y PRIORIZADO
        '/auth': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          timeout: 10000, // 10 segundos de timeout
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('🚨 Proxy error en /auth:', err.message);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                  error: 'Proxy error', 
                  message: `No se pudo conectar con el servidor de autenticación: ${err.message}`,
                  details: 'Verifique que el servidor esté ejecutándose en ' + API_BASE_URL
                }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🔐 Auth request: ${req.method} ${req.url}`);
              
              // Headers específicos para autenticación
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              
              // Preservar Content-Type para POST requests
              if (req.method === 'POST' || req.method === 'PUT') {
                proxyReq.setHeader('Content-Type', 'application/json');
              }
              
              // Preservar Authorization header si existe
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
              
              // Log para debugging
              console.log('🔐 Auth request headers:', {
                'Content-Type': proxyReq.getHeader('Content-Type'),
                'Authorization': proxyReq.getHeader('Authorization') ? 'Present' : 'Not present',
                'Origin': proxyReq.getHeader('Origin'),
                'Host': proxyReq.getHeader('Host')
              });
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`🔐 Auth response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
              
              // Agregar headers CORS específicos para auth
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Max-Age'] = '86400';
              
              // Log de respuesta para debugging
              if (proxyRes.statusCode !== 200) {
                console.warn(`⚠️ Auth response no exitosa: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
              }
              
              // Para OPTIONS requests, asegurar status 200
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
                proxyRes.statusMessage = 'OK';
              }
            });
          }
        },
        
        // Proxy para API de sectores (SIN AUTENTICACIÓN)
        '/api/sector': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api\/sector/, '/sector');
            console.log(`🔄 Reescribiendo sector: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error en /api/sector:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`📡 Sector request: ${req.method} ${req.url}`);
              
              // Limpiar headers de autenticación
              if (proxyReq.hasHeader('Authorization')) proxyReq.removeHeader('Authorization');
              if (proxyReq.hasHeader('Cookie')) proxyReq.removeHeader('Cookie');
              
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              proxyReq.setHeader('Content-Type', 'application/json');
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`📡 Sector response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
              
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
              }
            });
          }
        },
        
        // Proxy para API de vías (SIN AUTENTICACIÓN)
        '/api/via': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api\/via/, '/via');
            console.log(`🔄 Reescribiendo via: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error en /api/via:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🛣️ Via request: ${req.method} ${req.url}`);
              
              // Limpiar headers de autenticación
              if (proxyReq.hasHeader('Authorization')) proxyReq.removeHeader('Authorization');
              if (proxyReq.hasHeader('Cookie')) proxyReq.removeHeader('Cookie');
              
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              proxyReq.setHeader('Content-Type', 'application/json');
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`🛣️ Via response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
              
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
              }
            });
          }
        },
        
        // Proxy para API de barrios (SIN AUTENTICACIÓN)
        '/api/barrio': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api\/barrio/, '/barrio');
            console.log(`🔄 Reescribiendo barrio: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Limpiar headers de autenticación
              if (proxyReq.hasHeader('Authorization')) proxyReq.removeHeader('Authorization');
              if (proxyReq.hasHeader('Cookie')) proxyReq.removeHeader('Cookie');
              
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              proxyReq.setHeader('Content-Type', 'application/json');
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            });
          }
        },
        
        // Proxy general para el resto de la API (CON AUTENTICACIÓN)
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            // No reescribir rutas que ya tienen sus propias reglas
            if (path.startsWith('/api/sector') || 
                path.startsWith('/api/via') || 
                path.startsWith('/api/barrio')) {
              return path;
            }
            // Reescribir otras rutas API
            const newPath = path.replace(/^\/api/, '');
            console.log(`🔄 Reescribiendo API general: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error en /api general:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, {
                  'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🌐 API general request: ${req.method} ${req.url}`);
              
              // Para APIs generales, preservar headers de autorización
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              
              console.log(`🌐 API general response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
            });
          }
        }
      }
    },
    
    // Variables de entorno disponibles en cliente
    define: {
      'process.env.VITE_DEV_TOKEN': JSON.stringify(env.VITE_DEV_TOKEN || ''),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    
    // Configuración de construcción para producción
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('hook-form')) return 'vendor-forms';
              return 'vendor';
            }
          }
        }
      }
    },
    
    // Optimizaciones para desarrollo
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        'zod', 
        '@hookform/resolvers/zod',
        'react-hook-form'
      ]
    }
  };
});