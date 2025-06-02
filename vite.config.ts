// vite.config.ts - PROXY CORREGIDO Y SIMPLIFICADO
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
        // 🔐 PROXY PARA AUTENTICACIÓN - PRIORIDAD MÁS ALTA
        '/auth': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const targetUrl = `${API_BASE_URL}${req.url}`;
              console.log(`🔐 AUTH PROXY REQUEST: ${req.method} ${req.url} -> ${targetUrl}`);
              
              // Headers específicos para autenticación
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', API_BASE_URL);
              
              // Para auth, preservar todos los headers
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              const targetUrl = `${API_BASE_URL}${req.url}`;
              console.log(`🔐 AUTH PROXY RESPONSE: ${proxyRes.statusCode} ${proxyRes.statusMessage} for ${req.url} (${targetUrl})`);
              
              // Headers CORS para auth
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
                proxyRes.statusMessage = 'OK';
              }
            });
            
            proxy.on('error', (err, req, res) => {
              const targetUrl = `${API_BASE_URL}${req.url}`;
              console.error(`❌ AUTH PROXY ERROR for ${req.url}:`);
              console.error(`   Target URL: ${targetUrl}`);
              console.error(`   Error: ${err.message}`);
            });
          }
        },
        
        // 🎯 PROXY PARA APIs DE DATOS - SIN REESCRIBIR
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: false,
          // ✅ NO REESCRIBIR - Las APIs reales SÍ tienen /api
          // /api/sector -> http://192.168.20.160:8080/api/sector
          // /api/barrio -> http://192.168.20.160:8080/api/barrio  
          // /api/via -> http://192.168.20.160:8080/api/via
          configure: (proxy, _options) => {
            // Log de peticiones salientes para APIs de datos
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const targetUrl = `${API_BASE_URL}${req.url || ''}`;
              console.log(`📤 API PROXY REQUEST: ${req.method} ${req.url} -> ${targetUrl}`);
              
              // Asegurar headers correctos
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', API_BASE_URL);
              
              // Para APIs de datos, NO incluir auth headers
              proxyReq.removeHeader('Authorization');
              proxyReq.removeHeader('Cookie');
            });
            
            // Log de respuestas
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              const targetUrl = `${API_BASE_URL}${req.url || ''}`;
              console.log(`📥 API PROXY RESPONSE: ${proxyRes.statusCode} ${proxyRes.statusMessage} for ${req.url} (${targetUrl})`);
              
              // Si hay error, mostrar más detalles
              if (proxyRes.statusCode >= 400) {
                console.error(`❌ API PROXY ERROR: ${proxyRes.statusCode} for ${req.url}`);
                console.error(`   Target URL: ${targetUrl}`);
              }
              
              // Agregar headers CORS a la respuesta
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              
              // Manejar preflight requests
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
                proxyRes.statusMessage = 'OK';
              }
            });
            
            // Log de errores de proxy
            proxy.on('error', (err, req, res) => {
              const targetUrl = `${API_BASE_URL}${req.url || ''}`;
              console.error(`❌ API PROXY ERROR for ${req.url}:`);
              console.error(`   Target URL: ${targetUrl}`);
              console.error(`   Error: ${err.message}`);
              
              // Enviar respuesta de error personalizada
              if (!res.headersSent) {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({
                  error: 'Proxy Error',
                  message: `No se pudo conectar con ${targetUrl}`,
                  details: err.message,
                  target: targetUrl
                }));
              }
            });
          }
        }
      }
    },
    
    // Variables de entorno disponibles en cliente
    define: {
      'process.env.VITE_DEV_TOKEN': JSON.stringify(env.VITE_DEV_TOKEN || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_API_URL': JSON.stringify(API_BASE_URL)
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