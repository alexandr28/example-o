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

// API de notificaciones para mostrar, eliminar y suscribirse a cambios
export const NotificationService = {
  // Añadir una nueva notificación
  show: (message: string, type: NotificationType = 'info'): string => {
    // Eliminar notificaciones duplicadas (mismo mensaje y tipo)
    notifications = notifications.filter(n => !(n.message === message && n.type === type));
    const id = generateId();
    notifications.push({ id, message, type });
    notifyListeners();
    
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
  
  // Eliminar una notificación por id
  remove: (id: string): void => {
    notifications = notifications.filter(n => n.id !== id);
    notifyListeners();
  },
  
  // Limpiar todas las notificaciones
  clear: (): void => {
    notifications = [];
    notifyListeners();
  },
  
  // Suscribirse a cambios en las notificaciones
  subscribe: (listener: () => void): () => void => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  // Obtener todas las notificaciones actuales
  getAll: (): Notification[] => {
    return [...notifications];
  }
};

// Componente de notificación individual con barra de progreso
const NotificationItem: React.FC<Notification & { onClose: (id: string) => void }> = ({ id, message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Duración total de la barra de progreso y de la notificación (ms)
    const duration = 2000;
    const intervalMs = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalMs;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(percent);
      if (elapsed >= duration) {
        clearInterval(interval);
        handleClose();
      }
    }, intervalMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

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
        flex items-center p-4 mb-2 rounded-md shadow-md transition-all duration-300 relative
        ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100'}
        ${type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : ''}
        ${type === 'error' ? 'bg-red-100 border-l-4 border-red-500' : ''}
        ${type === 'info' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
        ${type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' : ''}
      `}
      style={{ overflow: 'hidden' }}
    >
      {/* Icono según el tipo de notificación */}
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
      
      {/* Mensaje de la notificación */}
      <div className="flex-1 text-sm">
        {message}
      </div>
      
      {/* Botón para cerrar la notificación */}
      <button 
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={handleClose}
      >
        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      {/* Barra de progreso */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 4,
          width: `${progress}%`,
          background:
            type === 'success'
              ? '#22c55e'
              : type === 'error'
              ? '#ef4444'
              : type === 'info'
              ? '#3b82f6'
              : type === 'warning'
              ? '#eab308'
              : '#6b7280',
          transition: 'width 50ms linear',
        }}
      />
    </div>
  );
};

// Renderiza todas las notificaciones activas en la parte inferior derecha de la pantalla
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
    <div
      className="fixed z-50 w-80 max-w-full"
      style={{
        right: 16,
        bottom: 16,
        top: 'auto',
        left: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'flex-end'
      }}
    >
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