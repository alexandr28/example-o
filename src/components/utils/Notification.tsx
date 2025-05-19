// src/components/utils/Notification.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Tipos para la notificación
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

// Función para generar un ID único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Almacén global de notificaciones
let notifications: Notification[] = [];
let listeners: (() => void)[] = [];

// Función para notificar a los listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// API de notificaciones
export const NotificationService = {
  // Añadir una nueva notificación
  show: (message: string, type: NotificationType = 'info'): string => {
    const id = generateId();
    notifications.push({ id, message, type });
    notifyListeners();
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      NotificationService.remove(id);
    }, 5000);
    
    return id;
  },
  
  // Mostrar una notificación de éxito
  success: (message: string): string => {
    return NotificationService.show(message, 'success');
  },
  
  // Mostrar una notificación de error
  error: (message: string): string => {
    return NotificationService.show(message, 'error');
  },
  
  // Mostrar una notificación de información
  info: (message: string): string => {
    return NotificationService.show(message, 'info');
  },
  
  // Mostrar una notificación de advertencia
  warning: (message: string): string => {
    return NotificationService.show(message, 'warning');
  },
  
  // Eliminar una notificación
  remove: (id: string): void => {
    notifications = notifications.filter(n => n.id !== id);
    notifyListeners();
  },
  
  // Limpiar todas las notificaciones
  clear: (): void => {
    notifications = [];
    notifyListeners();
  },
  
  // Suscribirse a cambios
  subscribe: (listener: () => void): () => void => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  // Obtener todas las notificaciones
  getAll: (): Notification[] => {
    return [...notifications];
  }
};

// Componente de notificación individual
const NotificationItem: React.FC<Notification & { onClose: (id: string) => void }> = ({ id, message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  // Iniciar animación de salida antes de cerrar
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Duración de la animación
  };
  
  return (
    <div 
      className={`
        flex items-center p-4 mb-2 rounded-md shadow-md transition-all duration-300
        ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100'}
        ${type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : ''}
        ${type === 'error' ? 'bg-red-100 border-l-4 border-red-500' : ''}
        ${type === 'info' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
        ${type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' : ''}
      `}
    >
      <div className="mr-3">
        {type === 'success' && (
          <svg className="w-6 h-6 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-6 h-6 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
        {type === 'info' && (
          <svg className="w-6 h-6 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )}
        {type === 'warning' && (
          <svg className="w-6 h-6 text-yellow-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        )}
      </div>
      
      <div className="flex-1 text-sm">
        {message}
      </div>
      
      <button 
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={handleClose}
      >
        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

// Componente contenedor de notificaciones
const NotificationContainer: React.FC = () => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Suscribirse a cambios en las notificaciones
    const unsubscribe = NotificationService.subscribe(() => {
      setLocalNotifications(NotificationService.getAll());
    });
    
    // Cargar notificaciones iniciales
    setLocalNotifications(NotificationService.getAll());
    
    return unsubscribe;
  }, []);
  
  // Si no hay notificaciones, no renderizar nada
  if (localNotifications.length === 0) {
    return null;
  }
  
  return ReactDOM.createPortal(
    <div className="fixed top-4 right-4 z-50 w-80 max-w-full">
      {localNotifications.map(notification => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onClose={NotificationService.remove}
        />
      ))}
    </div>,
    document.body
  );
};

export default NotificationContainer;