// src/components/debug/AuthDebugPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';

/**
 * Panel de depuración para verificar el estado de autenticación
 * Solo visible en modo desarrollo con Ctrl+Shift+D
 */
const AuthDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>({});
  const auth = useAuthContext();

  // Actualizar información del token
  const updateTokenInfo = () => {
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('auth_token_expiry');
    const user = localStorage.getItem('auth_user');
    
    let userObj = null;
    try {
      userObj = user ? JSON.parse(user) : null;
    } catch (e) {
      userObj = { error: 'Invalid JSON' };
    }

    const expiryDate = expiry ? new Date(expiry) : null;
    const now = new Date();
    const isExpired = expiryDate ? expiryDate < now : true;
    const timeUntilExpiry = expiryDate ? Math.floor((expiryDate.getTime() - now.getTime()) / 1000) : 0;

    setTokenInfo({
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      expiryDate: expiryDate ? expiryDate.toLocaleString() : 'Not set',
      isExpired,
      timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.floor(timeUntilExpiry / 60)}m ${timeUntilExpiry % 60}s` : 'Expired',
      user: userObj,
      isAuthenticated: auth.isAuthenticated,
      authLoading: auth.loading,
      authError: auth.error
    });
  };

  // Escuchar combinación de teclas para mostrar/ocultar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
        updateTokenInfo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Actualizar info cada segundo cuando está visible
  useEffect(() => {
    if (isVisible) {
      updateTokenInfo();
      const interval = setInterval(updateTokenInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  // Funciones de utilidad para testing
  const simulateTokenExpiry = () => {
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + 5); // Expira en 5 segundos
    localStorage.setItem('auth_token_expiry', expiry.toISOString());
    updateTokenInfo();
    alert('Token expirará en 5 segundos');
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token_expiry');
    updateTokenInfo();
    alert('Datos de autenticación limpiados');
  };

  const renewToken = async () => {
    try {
      const success = await auth.renewToken();
      alert(success ? 'Token renovado exitosamente' : 'Error al renovar token');
      updateTokenInfo();
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md z-50"
      style={{ fontFamily: 'monospace', fontSize: '12px' }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-yellow-400 font-bold">🔐 Auth Debug Panel</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-400">Has Token:</div>
          <div className={tokenInfo.hasToken ? 'text-green-400' : 'text-red-400'}>
            {tokenInfo.hasToken ? '✓ Yes' : '✗ No'}
          </div>

          <div className="text-gray-400">Is Authenticated:</div>
          <div className={tokenInfo.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {tokenInfo.isAuthenticated ? '✓ Yes' : '✗ No'}
          </div>

          <div className="text-gray-400">Token Status:</div>
          <div className={tokenInfo.isExpired ? 'text-red-400' : 'text-green-400'}>
            {tokenInfo.isExpired ? 'Expired' : 'Valid'}
          </div>

          <div className="text-gray-400">Time Left:</div>
          <div className={tokenInfo.isExpired ? 'text-red-400' : 'text-yellow-400'}>
            {tokenInfo.timeUntilExpiry}
          </div>

          <div className="text-gray-400">Expiry:</div>
          <div className="text-blue-400 col-span-1 text-xs">
            {tokenInfo.expiryDate}
          </div>

          <div className="text-gray-400">User:</div>
          <div className="text-green-400">
            {tokenInfo.user?.username || 'None'}
          </div>

          <div className="text-gray-400">Auth Loading:</div>
          <div className={tokenInfo.authLoading ? 'text-yellow-400' : 'text-gray-500'}>
            {tokenInfo.authLoading ? 'Loading...' : 'Idle'}
          </div>

          <div className="text-gray-400">Auth Error:</div>
          <div className="text-red-400 col-span-1 text-xs">
            {tokenInfo.authError || 'None'}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-3">
          <div className="text-gray-400 mb-2">Token Preview:</div>
          <div className="text-blue-300 text-xs break-all bg-gray-800 p-2 rounded">
            {tokenInfo.tokenPreview}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-3">
          <div className="text-gray-400 mb-2">Actions:</div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={renewToken}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              🔄 Renew Token
            </button>
            <button 
              onClick={simulateTokenExpiry}
              className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
            >
              ⏱️ Expire in 5s
            </button>
            <button 
              onClick={clearAuthData}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            >
              🗑️ Clear Auth
            </button>
            <button 
              onClick={updateTokenInfo}
              className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
            >
              🔍 Refresh
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Press Ctrl+Shift+D to toggle this panel
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPanel;