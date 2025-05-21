// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // URL base de la API (con valor por defecto)
  const API_BASE_URL = env.VITE_API_URL || 'http://localhost:8080';
  console.log('🔧 Configurando Vite con API_BASE_URL:', API_BASE_URL);
  
  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    // Configuración del servidor de desarrollo
    server: {
      port: 3000,
      // Para hacer la app accesible desde la red local
      host: true,  // Usar '0.0.0.0' en vez de 'localhost' (escucha en todas las interfaces)
      strictPort: true, // No intentar otro puerto si 3000 está ocupado
      // Mostrar dirección de red al iniciar
      // Opciones para obtener mejor información de errores
      hmr: { 
        overlay: true,
        // Opciones para hot module replacement
        clientPort: 3000, // Puerto fijo para WebSocket HMR

      },
      
      // Configuración de proxy para todas las peticiones a la API
      proxy: {
        // Proxy para endpoints de autenticación
        '/auth': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          credentials: 'include', // Permitir cookies para autenticación
          configure: (proxy, _options) => {
            // Manejar errores de proxy
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error en /auth:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, {
                  'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            // Modificar la petición de proxy
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`Proxy auth request: ${req.method} ${req.url}`);
              
              // Agregar encabezados para evitar problemas de CORS
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              
              // Preservar encabezados de autorización
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
              
              // Modificar métodos OPTIONS para CORS preflight
              if (req.method === 'OPTIONS') {
                proxyReq.setHeader('Access-Control-Request-Headers', 'authorization, content-type');
                proxyReq.setHeader('Access-Control-Request-Method', 'GET, POST, PUT, DELETE, PATCH');
              }
            });
            
            // Modificar la respuesta del proxy
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              // Agregar encabezados CORS a la respuesta
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Max-Age'] = '86400'; // 24 horas
              
              console.log(`Proxy auth response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
            });
          }
        },
        
        // Proxy para API de sectores (SIN AUTENTICACIÓN Y MEJORADO)
        '/api/sector': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            // Verificar si la ruta contiene api/sector y reescribirla correctamente
            const newPath = path.replace(/^\/api\/sector/, '/sector');
            console.log(`Reescribiendo ruta: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error en /api/sector:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, {
                  'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`Proxy request to sector: ${req.method} ${req.url}`);
              
              // IMPORTANTE: Limpiar todas las cabeceras de autenticación
              if (proxyReq.hasHeader('Authorization')) {
                console.log('Eliminando header Authorization');
                proxyReq.removeHeader('Authorization');
              }
              if (proxyReq.hasHeader('authorization')) {
                console.log('Eliminando header authorization');
                proxyReq.removeHeader('authorization');
              }
              if (proxyReq.hasHeader('Cookie')) {
                console.log('Eliminando header Cookie');
                proxyReq.removeHeader('Cookie');
              }
              
              // Establecer los encabezados correctos
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              proxyReq.setHeader('Content-Type', 'application/json');
              
              // Añadir token de desarrollo si está configurado
              const devToken = env.VITE_DEV_TOKEN;
              if (devToken) {
                console.log('Añadiendo token de desarrollo');
                proxyReq.setHeader('X-Dev-Token', devToken);
              }
              
              // Mostrar cabeceras finales para depuración
              const headersObj = {};
              Object.keys(proxyReq.getHeaders()).forEach(key => {
                headersObj[key] = proxyReq.getHeaders()[key];
              });
              console.log('Headers finales:', JSON.stringify(headersObj, null, 2));
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`Proxy sector response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
              console.log('Headers de respuesta:', JSON.stringify(proxyRes.headers, null, 2));
              
              // Agregar encabezados CORS a la respuesta
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Max-Age'] = '86400'; // 24 horas
              
              // Para peticiones OPTIONS, asegurar código 200
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
              }
              
              // Si hay error 403, capturar y mostrar el cuerpo de la respuesta
              if (proxyRes.statusCode === 403) {
                let responseBody = '';
                
                proxyRes.on('data', chunk => {
                  responseBody += chunk;
                });
                
                proxyRes.on('end', () => {
                  console.error('Error 403 en sector. Cuerpo de respuesta:', responseBody);
                });
              }
            });
          }
        },
        
        // Proxy para API de vías (SIN AUTENTICACIÓN Y MEJORADO)
        '/api/via': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api\/via/, '/via');
            console.log(`Reescribiendo ruta: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error en /api/via:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, {
                  'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`Proxy request to via: ${req.method} ${req.url}`);
              
              // IMPORTANTE: Limpiar todas las cabeceras de autenticación
              if (proxyReq.hasHeader('Authorization')) proxyReq.removeHeader('Authorization');
              if (proxyReq.hasHeader('authorization')) proxyReq.removeHeader('authorization');
              if (proxyReq.hasHeader('Cookie')) proxyReq.removeHeader('Cookie');
              
              // Establecer los encabezados correctos
              proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              proxyReq.setHeader('Content-Type', 'application/json');
              
              // Añadir token de desarrollo si está configurado
              const devToken = env.VITE_DEV_TOKEN;
              if (devToken) {
                proxyReq.setHeader('X-Dev-Token', devToken);
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`Proxy via response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
              
              // Agregar encabezados CORS a la respuesta
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Max-Age'] = '86400'; // 24 horas
              
              // Para peticiones OPTIONS, asegurar código 200
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
              }
            });
          }
        },
        
        // Proxy para API de barrios (SIN AUTENTICACIÓN Y MEJORADO)
       '/api/barrio': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
          const newPath = path.replace(/^\/api\/barrio/, '/barrio');
          console.log(`Reescribiendo ruta: ${path} → ${newPath}`);
          return newPath;
        },
        configure: (proxy, _options) => {
          // Configuración para evitar problemas CORS
           proxy.on('proxyReq', (proxyReq, req, _res) => {
         // IMPORTANTE: Limpiar todas las cabeceras de autenticación
           if (proxyReq.hasHeader('Authorization')) proxyReq.removeHeader('Authorization');
           if (proxyReq.hasHeader('authorization')) proxyReq.removeHeader('authorization');
          if (proxyReq.hasHeader('Cookie')) proxyReq.removeHeader('Cookie');
      
          // Establecer los encabezados correctos
          proxyReq.setHeader('Host', new URL(API_BASE_URL).host);
           proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
          proxyReq.setHeader('Content-Type', 'application/json');
          });
        }
        },
        
        // Proxy general para el resto de la API (CON AUTENTICACIÓN)
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            // Asegurarse de que no reescriba rutas que ya tienen sus propias reglas
            if (
              path.startsWith('/api/sector') || 
              path.startsWith('/api/via') || 
              path.startsWith('/api/barrio')
            ) {
              return path;
            }
            // Reescribir otras rutas API
            const newPath = path.replace(/^\/api/, '');
            console.log(`Reescribiendo ruta general: ${path} → ${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error en /api general:', err);
              if (!res.headersSent && res.writeHead) {
                res.writeHead(500, {
                  'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`Proxy general request: ${req.method} ${req.url}`);
              
              // Agregar encabezados para evitar problemas de CORS
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:3000');
              
              // Para las demás APIs, preservar encabezados de autorización
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              // Agregar encabezados CORS a la respuesta
              proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Requested-With';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Max-Age'] = '86400'; // 24 horas
              
              console.log(`Proxy general response: ${req.method} ${req.url} - ${proxyRes.statusCode}`);
            });
          }
        }
      }
    },
    
    // Variables de entorno disponibles en cliente
    define: {
      // Esto permite acceder a env.VITE_DEV_TOKEN en el código cliente
      'process.env.VITE_DEV_TOKEN': JSON.stringify(env.VITE_DEV_TOKEN || ''),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    
    // Configuración de construcción para producción
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Optimizaciones para producción
      minify: mode === 'production',
      // División de chunks para mejor carga
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('hook-form')) return 'vendor-forms';
              return 'vendor'; // todos los demás módulos de node_modules
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