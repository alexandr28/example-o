// src/components/debug/CorsTroubleshooter.tsx
import React, { useState } from 'react';
import { NotificationService } from '../utils/Notification';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const CorsTroubleshooter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  // URLs a probar
  const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080';
  const endpoints = [
    { name: 'Sectores (Directo)', url: `${API_BASE}/api/sector`, useProxy: false },
    { name: 'Sectores (Proxy)', url: '/api/sector', useProxy: true },
    { name: 'Health Check', url: `${API_BASE}/health`, useProxy: false },
    { name: 'Options Preflight', url: `${API_BASE}/api/sector`, method: 'OPTIONS', useProxy: false }
  ];

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    for (const endpoint of endpoints) {
      const result: TestResult = {
        test: endpoint.name,
        status: 'pending',
        message: 'Probando...',
        details: { url: endpoint.url, useProxy: endpoint.useProxy }
      };

      setResults(prev => [...prev, result]);

      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.url, {
          method: endpoint.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit'
        });

        const elapsed = Date.now() - startTime;

        result.status = response.ok ? 'success' : 'error';
        result.message = `${response.status} ${response.statusText} (${elapsed}ms)`;
        result.details = {
          ...result.details,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          elapsed
        };

        if (response.ok && endpoint.method !== 'OPTIONS') {
          try {
            const data = await response.json();
            result.details.dataPreview = Array.isArray(data) 
              ? `Array con ${data.length} elementos` 
              : typeof data;
          } catch (e) {
            result.details.dataError = 'No se pudo parsear JSON';
          }
        }

      } catch (error: any) {
        result.status = 'error';
        result.message = error.message;
        result.details = {
          ...result.details,
          errorType: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        };
      }

      setResults(prev => 
        prev.map(r => r.test === result.test ? result : r)
      );

      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  const copySolution = () => {
    const solution = `
// 1. Verificar que Vite esté corriendo con proxy configurado:
// En vite.config.ts debe estar configurado el proxy para /api

// 2. En desarrollo, usar URLs relativas:
const API_URL = import.meta.env.DEV ? '/api/sector' : '${API_BASE}/api/sector';

// 3. Si persiste el error, verificar:
// - El backend está corriendo en ${API_BASE}
// - El backend tiene CORS habilitado
// - No hay firewall bloqueando el puerto 8080
    `.trim();

    navigator.clipboard.writeText(solution);
    NotificationService.success('Solución copiada al portapapeles');
  };

  // Tecla de acceso rápido
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-2xl z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          🔧 CORS Troubleshooter
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={runTests}
            disabled={testing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'Probando...' : '🧪 Ejecutar Pruebas'}
          </button>
          <button
            onClick={copySolution}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            📋 Copiar Solución
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div 
                key={idx}
                className="border rounded p-3 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {getStatusIcon(result.status)} {result.test}
                  </span>
                  <span className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </span>
                </div>
                
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                      Ver detalles
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>💡 Diagnóstico:</strong> El error indica problemas de CORS. 
            En desarrollo, asegúrate de:
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 list-disc list-inside">
            <li>El servidor backend está corriendo en {API_BASE}</li>
            <li>Vite está usando el proxy configurado (puerto 3000)</li>
            <li>Usar URLs relativas (/api/sector) en lugar de absolutas</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Presiona Ctrl+Shift+C para abrir/cerrar este panel
        </div>
      </div>
    </div>
  );
};

export default CorsTroubleshooter;