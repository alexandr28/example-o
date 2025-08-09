// src/components/auth/AuthHandler.tsx - SIN AUTOLOGIN AUTOMÁTICO
import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

// Componente simple de notificación
const Notification: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = 
    type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
    type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
    'bg-blue-100 border-blue-400 text-blue-700';
  
  return (
    <div className={`p-4 mb-2 rounded-md border ${bgColor} shadow-md`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Gestor de notificaciones
const NotificationManager: React.FC<{
  notifications: Array<{id: string; message: string; type: 'success' | 'error' | 'info'}>;
  onClose: (id: string) => void;
}> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-72 space-y-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
};

/**
 * Componente para manejar la autenticación - SIN AUTOLOGIN
 */
const AuthHandler: React.FC = () => {
  const auth = useAuthContext();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>>([]);
  
  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };
  
  // Función para cerrar notificaciones
  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // 🚫 AUTOLOGIN REMOVIDO COMPLETAMENTE
  // Ya no hay autologin automático - el usuario debe hacer login manualmente
  
  // Monitor de estado de autenticación
  useEffect(() => {
    console.log('🔐 Estado de autenticación:', auth.isAuthenticated ? 'Autenticado' : 'No autenticado');
    
    if (auth.error && auth.error !== 'La sesión ha expirado. Por favor, inicie sesión nuevamente.') {
      console.error('❌ Error de autenticación:', auth.error);
      showNotification(auth.error, 'error');
    }
  }, [auth.isAuthenticated, auth.error]);
  
  // Verificación de token periódica
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem('auth_token');
      const expiry = localStorage.getItem('auth_token_expiry');
      
      if (token && expiry) {
        const expiryDate = new Date(expiry);
        const now = new Date();
        
        // Si el token expira en menos de 2 minutos, intentar renovarlo
        if (expiryDate.getTime() - now.getTime() < 2 * 60 * 1000) {
          console.log('⚠️ Token a punto de expirar, intentando renovar');
          auth.renewToken().then(success => {
            if (success) {
              console.log('✅ Token renovado');
              showNotification('Sesión renovada automáticamente', 'info');
            } else {
              console.log('❌ No se pudo renovar token');
              showNotification('Su sesión expirará pronto. Por favor, guarde su trabajo.', 'error');
            }
          });
        }
      }
    };
    
    // Verificar cada minuto
    const interval = setInterval(checkTokenValidity, 60 * 15000);
    
    return () => clearInterval(interval);
  }, [auth]);
  
  // Debug en modo desarrollo (solo con Alt+D)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && e.key === 'd') {
          const token = localStorage.getItem('auth_token');
          const expiry = localStorage.getItem('auth_token_expiry');
          const expiryDate = expiry ? new Date(expiry) : null;
          const isExpired = expiryDate ? expiryDate < new Date() : true;
          
          console.log('🔑 Token Information:');
          console.log('- Token exists:', !!token);
          if (token) console.log('- Token preview:', token.substring(0, 15) + '...');
          console.log('- Expiry date:', expiryDate ? expiryDate.toLocaleString() : 'None');
          console.log('- Is expired:', isExpired);
          console.log('- Is authenticated:', auth.isAuthenticated);
          console.log('- User:', auth.user?.username || 'None');
          
          // Renovación manual con Shift+Alt+D
          if (e.shiftKey) {
            console.log('🔄 Intentando renovar token manualmente...');
            auth.renewToken().then(success => {
              const message = success ? 'Token renovado manualmente' : 'Renovación manual fallida';
              const type = success ? 'success' : 'error';
              console.log(success ? '✅ Token renovado manualmente' : '❌ Renovación manual fallida');
              showNotification(message, type);
            });
          }
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [auth]);
  
  return (
    <NotificationManager 
      notifications={notifications} 
      onClose={closeNotification} 
    />
  );
};

export default AuthHandler;