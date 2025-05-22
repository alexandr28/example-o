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
 * Componente para manejar la autenticación automática y mostrar notificaciones
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
  
  // Efecto para autologin en desarrollo
 useEffect(() => {
  const attemptAutoLogin = async () => {
    // Solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // Verificar si el usuario cerró sesión explícitamente
      const explicitLogout = localStorage.getItem('explicit_logout') === 'true';
      const logoutTimeStr = localStorage.getItem('explicit_logout_time');
      
      // Si el logout fue explícito y hace menos de 10 minutos, no hacer autologin
      if (explicitLogout && logoutTimeStr) {
        const logoutTime = new Date(logoutTimeStr);
        const now = new Date();
        const minutesSinceLogout = (now.getTime() - logoutTime.getTime()) / (1000 * 60);
        
        if (minutesSinceLogout < 10) { // 10 minutos de "periodo de gracia"
          console.log('⚠️ No se realizará autologin porque el usuario cerró sesión hace menos de 10 minutos');
          return;
        } else {
          // Limpiar la marca de logout si ya pasaron más de 10 minutos
          localStorage.removeItem('explicit_logout');
          localStorage.removeItem('explicit_logout_time');
        }
      }
      
      // Verificar si ya hay token
      const hasToken = localStorage.getItem('auth_token');
      
      if (!hasToken && !auth.isAuthenticated) {
        console.log('🔄 Desarrollo: Sin token, intentando login automático');
        
        // Resto del código de autologin...
      }
    }
  };
  
  attemptAutoLogin();
}, [auth]);
  
  // Monitor de estado de autenticación
  useEffect(() => {
    console.log('🔐 Estado de autenticación:', auth.isAuthenticated ? 'Autenticado' : 'No autenticado');
    
    if (auth.error) {
      console.error('❌ Error de autenticación:', auth.error);
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
            console.log(success ? '✅ Token renovado' : '❌ No se pudo renovar token');
          });
        }
      }
    };
    
    // Verificar cada minuto
    const interval = setInterval(checkTokenValidity, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [auth]);
  
  // Solo en modo desarrollo, agregar depuración básica
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkTokenInfo = () => {
        const token = localStorage.getItem('auth_token');
        const expiry = localStorage.getItem('auth_token_expiry');
        const expiryDate = expiry ? new Date(expiry) : null;
        const isExpired = expiryDate ? expiryDate < new Date() : true;
        
        console.log('🔑 Token Information:');
        console.log('- Token exists:', !!token);
        if (token) console.log('- Token preview:', token.substring(0, 15) + '...');
        console.log('- Expiry date:', expiryDate ? expiryDate.toLocaleString() : 'None');
        console.log('- Is expired:', isExpired);
      };
      
      // Verificar token al inicio
      checkTokenInfo();
      
      // Hacer debug con Alt+D
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && e.key === 'd') {
          checkTokenInfo();
          
          // También para renovación manual
          if (e.shiftKey) {
            console.log('🔄 Intentando renovar token manualmente...');
            auth.renewToken().then(success => {
              console.log(success ? '✅ Token renovado manualmente' : '❌ Renovación manual fallida');
              showNotification(
                success ? 'Token renovado manualmente' : 'Renovación manual fallida',
                success ? 'success' : 'error'
              );
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