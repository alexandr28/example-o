// src/components/debug/AuthStatusDebug.tsx
import React, { useEffect, useState } from 'react';

const AuthStatusDebug: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<{
    token: string | null;
    user: any;
    tokenLength: number;
    isExpired: boolean;
  }>({
    token: null,
    user: null,
    tokenLength: 0,
    isExpired: false
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      let user = null;
      
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      // Verificar si el token está expirado
      let isExpired = false;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // convertir a milisegundos
          isExpired = Date.now() > exp;
        } catch (e) {
          console.error('Error checking token expiration:', e);
        }
      }

      setAuthInfo({
        token,
        user,
        tokenLength: token ? token.length : 0,
        isExpired
      });
    };

    // Verificar inicialmente
    checkAuth();

    // Verificar cada 5 segundos
    const interval = setInterval(checkAuth, 5000);

    return () => clearInterval(interval);
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2 text-yellow-400">🔐 Auth Status</h4>
      
      <div className="space-y-1">
        <div className="flex items-center">
          <span className="w-20">Token:</span>
          <span className={authInfo.token ? 'text-green-400' : 'text-red-400'}>
            {authInfo.token ? `✓ ${authInfo.tokenLength} chars` : '✗ No token'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="w-20">User:</span>
          <span className={authInfo.user ? 'text-green-400' : 'text-red-400'}>
            {authInfo.user ? `✓ ${authInfo.user.username}` : '✗ No user'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="w-20">Expired:</span>
          <span className={authInfo.isExpired ? 'text-red-400' : 'text-green-400'}>
            {authInfo.isExpired ? '✗ Yes' : '✓ No'}
          </span>
        </div>
      </div>
      
      {authInfo.token && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="font-mono text-xs break-all">
            Token preview: {authInfo.token.substring(0, 30)}...
          </div>
        </div>
      )}
      
      <button
        onClick={() => {
          const token = localStorage.getItem('auth_token');
          if (token) {
            console.log('Full token:', token);
            navigator.clipboard.writeText(token);
            alert('Token copiado al portapapeles');
          }
        }}
        className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
      >
        Copy Token
      </button>
    </div>
  );
};

export default AuthStatusDebug;