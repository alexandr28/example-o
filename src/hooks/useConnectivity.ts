// src/hooks/useConnectivity.ts
/**
 * Hook de React para monitorear la conectividad
 * Usa el servicio de conectividad singleton
 */

import { useState, useEffect } from 'react';
import { connectivityService } from '../services/connectivityService';
import type { ApiStatus } from '../services/connectivityService';

/**
 * Hook para monitorear el estado de conectividad y APIs
 * @returns Estado de conectividad y métodos útiles
 */
export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState<boolean>(connectivityService.getStatus());
  const [apiStatus, setApiStatus] = useState<Map<string, ApiStatus>>(
    connectivityService.getAllApiStatus()
  );
  const [statistics, setStatistics] = useState(connectivityService.getStatistics());

  useEffect(() => {
    // Suscribirse a cambios de conectividad
    const unsubscribe = connectivityService.addListener((online) => {
      setIsOnline(online);
      setApiStatus(connectivityService.getAllApiStatus());
      setStatistics(connectivityService.getStatistics());
    });

    // Verificar estado inicial
    connectivityService.forceCheck().then(() => {
      setApiStatus(connectivityService.getAllApiStatus());
      setStatistics(connectivityService.getStatistics());
    });

    // Limpiar suscripción al desmontar
    return unsubscribe;
  }, []);

  /**
   * Fuerza una verificación de conectividad
   */
  const forceCheck = async (apiName?: string): Promise<boolean> => {
    const result = await connectivityService.forceCheck(apiName);
    setApiStatus(connectivityService.getAllApiStatus());
    setStatistics(connectivityService.getStatistics());
    return result;
  };

  /**
   * Verifica si una API específica está disponible
   */
  const isApiAvailable = (apiName: string): boolean => {
    const status = apiStatus.get(apiName);
    return status?.available || false;
  };

  /**
   * Obtiene el estado detallado de una API
   */
  const getApiDetails = (apiName: string): ApiStatus | undefined => {
    return apiStatus.get(apiName);
  };

  /**
   * Obtiene un resumen del estado de conectividad
   */
  const getSummary = () => {
    const totalApis = apiStatus.size;
    const availableApis = Array.from(apiStatus.values())
      .filter(status => status.available).length;
    
    return {
      isOnline,
      totalApis,
      availableApis,
      percentageAvailable: totalApis > 0 
        ? Math.round((availableApis / totalApis) * 100) 
        : 0,
      allApisAvailable: availableApis === totalApis,
      someApisAvailable: availableApis > 0
    };
  };

  return {
    // Estado
    isOnline,
    apiStatus,
    statistics,
    
    // Métodos
    forceCheck,
    isApiAvailable,
    getApiDetails,
    getSummary,
    
    // Acceso directo al servicio (para casos especiales)
    service: connectivityService
  };
};

/**
 * Hook para verificar conectividad de una API específica
 * @param apiName Nombre de la API a monitorear
 */
export const useApiConnectivity = (apiName: string) => {
  const [status, setStatus] = useState<ApiStatus | undefined>(
    connectivityService.getApiStatus(apiName)
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Actualizar estado inicial
    const currentStatus = connectivityService.getApiStatus(apiName);
    if (currentStatus) {
      setStatus(currentStatus);
      setIsAvailable(currentStatus.available);
    }

    // Suscribirse a cambios
    const unsubscribe = connectivityService.addListener((online, changedApiName) => {
      // Solo actualizar si es la API que estamos monitoreando o un cambio general
      if (!changedApiName || changedApiName === apiName) {
        const newStatus = connectivityService.getApiStatus(apiName);
        if (newStatus) {
          setStatus(newStatus);
          setIsAvailable(newStatus.available);
        }
      }
    });

    return unsubscribe;
  }, [apiName]);

  /**
   * Fuerza verificación de esta API específica
   */
  const checkNow = async (): Promise<boolean> => {
    const result = await connectivityService.forceCheck(apiName);
    const newStatus = connectivityService.getApiStatus(apiName);
    if (newStatus) {
      setStatus(newStatus);
      setIsAvailable(newStatus.available);
    }
    return result;
  };

  return {
    isAvailable,
    status,
    checkNow,
    responseTime: status?.responseTime,
    lastCheck: status?.lastCheck,
    error: status?.error
  };
};

/**
 * Hook para mostrar notificaciones de conectividad
 * @param showNotifications Si mostrar notificaciones automáticas
 */
export const useConnectivityNotifications = (
  showNotifications: boolean = true
) => {
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (!showNotifications) return;

    const unsubscribe = connectivityService.addListener((isOnline) => {
      if (!isOnline && !wasOffline) {
        // Acabamos de perder conexión
        setWasOffline(true);
        console.warn('🚫 Conexión perdida');
        // Aquí podrías mostrar una notificación toast
      } else if (isOnline && wasOffline) {
        // Conexión restaurada
        setWasOffline(false);
        console.log('✅ Conexión restaurada');
        // Aquí podrías mostrar una notificación toast
      }
    });

    return unsubscribe;
  }, [showNotifications, wasOffline]);

  return { wasOffline };
};