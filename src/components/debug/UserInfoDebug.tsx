// src/components/debug/UserInfoDebug.tsx
import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const UserInfoDebug: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const auth = useAuthContext();

  // Solo mostrar en desarrollo
  if (!import.meta.env.DEV) return null;

  const getUserInfo = () => {
    const storedUser = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    
    let userObj = null;
    try {
      userObj = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      userObj = { error: 'Invalid JSON' };
    }

    return {
      user: userObj,
      token: token ? `${token.substring(0, 30)}...` : 'No token',
      tokenFull: token
    };
  };

  const info = getUserInfo();

  return (
    <div className="fixed bottom-0 left-0 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-1 text-xs rounded-tr-md hover:bg-gray-700"
      >
        {isVisible ? '▼' : '▲'} Debug User
      </button>
      
      {isVisible && (
        <div className="bg-gray-900 text-white p-4 rounded-tr-lg max-w-md">
          <h3 className="text-sm font-bold mb-2">🔐 Usuario Actual</h3>
          
          {info.user ? (
            <div className="space-y-1 text-xs">
              <div><strong>ID:</strong> {info.user.id}</div>
              <div><strong>Username:</strong> {info.user.username}</div>
              <div><strong>Nombre:</strong> {info.user.nombreCompleto || 'No especificado'}</div>
              <div><strong>Roles:</strong> {
                Array.isArray(info.user.roles) 
                  ? info.user.roles.join(', ') 
                  : info.user.roles || 'Sin roles'
              }</div>
              <div className="mt-2">
                <strong>Token:</strong>
                <div className="font-mono text-xs break-all bg-gray-800 p-1 rounded mt-1">
                  {info.token}
                </div>
              </div>
              
              <div className="mt-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(info.tokenFull || '');
                    alert('Token copiado al portapapeles');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                >
                  Copiar Token Completo
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-red-400">No hay usuario autenticado</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserInfoDebug;