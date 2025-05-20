import { getAuthToken } from '../api/authClient';

/**
 * Servicio para monitorear y gestionar la conectividad con las APIs
 * y verificar el estado de autenticación
 */
class ConnectivityService {
  private isOnline: boolean = navigator.onLine;
  private apiStatus: { [key: string]: boolean } = {};
  private authStatus: { [key: string]: boolean } = {};
  private listeners: Array<(status: boolean, apiName?: string, isAuth?: boolean) => void> = [];
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 segundos
  private intervalId: number | null = null;

  // Lista de API endpoints a comprobar
  private apiEndpoints = [
    '/api/via',
    '/api/sector',
    '/api/barrio',
    '/api/direccion',
    '/api/contribuyente'
  ];

  constructor() {
    this.setupEventListeners();
    this.initializeApiStatus();
    this.checkAPIAvailability();
    this.startPeriodicChecks();
  }

  /**
   * Inicializa el estado de las APIs
   */
  private initializeApiStatus() {
    this.apiEndpoints.forEach(endpoint => {
      const apiName = this.getApiNameFromEndpoint(endpoint);
      this.apiStatus[apiName] = false;
      this.authStatus[apiName] = false;
    });
  }

  /**
   * Extrae el nombre de la API del endpoint
   */
  private getApiNameFromEndpoint(endpoint: string): string {
    // Extrae el nombre de la API del endpoint (e.g., '/api/via' -> 'via')
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Configura los listeners de eventos de red
   */
  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.checkAPIAvailability();
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
    });
  }

  /**
   * Inicia las comprobaciones periódicas de disponibilidad
   */
  private startPeriodicChecks() {
    // Limpiar intervalo existente si hay uno
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }

    // Configurar nuevo intervalo
    this.intervalId = window.setInterval(() => {
      this.checkAPIAvailability();
    }, this.checkInterval) as unknown as number;
  }

  /**
   * Actualiza el estado de todas las APIs
   */
  private updateAllApiStatus(status: boolean) {
    Object.keys(this.apiStatus).forEach(apiName => {
      this.apiStatus[apiName] = status;
      this.authStatus[apiName] = status;
    });
  }

  /**
   * Comprueba la disponibilidad de todas las APIs
   */
  private async checkAPIAvailability() {
    if (!navigator.onLine) {
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
      return;
    }

    // Evitar verificaciones demasiado frecuentes
    const now = Date.now();
    if (now - this.lastCheck < this.checkInterval / 2) return;
    this.lastCheck = now;

    // Comprobar cada endpoint
    const promises = this.apiEndpoints.map(endpoint => this.checkEndpoint(endpoint));
    
    try {
      await Promise.all(promises);
      // La aplicación está online si al menos una API está disponible
      this.isOnline = Object.values(this.apiStatus).some(status => status);
      this.notifyListeners();
    } catch (error) {
      console.warn('Error al comprobar disponibilidad de APIs:', error);
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
    }
  }

  /**
   * Comprueba la disponibilidad de un endpoint específico
   * Primero sin autenticación y luego con autenticación si hay token
   */
private async checkEndpoint(endpoint: string): Promise<boolean> {
  const apiName = this.getApiNameFromEndpoint(endpoint);
  
  try {
    // Para sectores, vías y barrios, no verificar autenticación
    const noAuthApis = ['sector', 'via', 'barrio'];
    const requiresAuth = !noAuthApis.includes(apiName);
    
    // Si no requiere autenticación o no hay conexión general a internet
    if (!requiresAuth || !navigator.onLine) {
      // Verificar disponibilidad básica sin autenticación
      const isAvailable = await this.checkBasicEndpoint(endpoint);
      this.apiStatus[apiName] = isAvailable;
      this.authStatus[apiName] = isAvailable; // Consideramos igual autenticación y disponibilidad
      
      return isAvailable;
    }
    
    // Para otras APIs que sí requieren autenticación
    // Verificar disponibilidad básica primero
    const isAvailable = await this.checkBasicEndpoint(endpoint);
    this.apiStatus[apiName] = isAvailable;
    
    // Si está disponible, verificar autenticación
    if (isAvailable) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const isAuthValid = await this.checkAuthenticatedEndpoint(endpoint, token);
        this.authStatus[apiName] = isAuthValid;
      } else {
        this.authStatus[apiName] = false;
      }
    } else {
      this.authStatus[apiName] = false;
    }
    
    return this.apiStatus[apiName];
  } catch (error) {
    console.warn(`API ${apiName} no disponible:`, error);
    this.apiStatus[apiName] = false;
    this.authStatus[apiName] = false;
    
    // Notificar específico para esta API
    this.notifyListeners(apiName);
    
    return false;
  }
}

  /**
   * Verifica la disponibilidad básica de un endpoint (sin autenticación)
   */
  private async checkBasicEndpoint(endpoint: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Intentar hacer una petición OPTIONS (preflight check)
      const response = await fetch(endpoint, {
        method: 'OPTIONS',
        signal: controller.signal,
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      return response.ok || response.status === 204; // OPTIONS suele devolver 204 No Content
    } catch (error) {
      // Si OPTIONS falla, intentar con HEAD
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          signal: controller.signal,
          credentials: 'omit'
        });
        
        clearTimeout(timeoutId);
        
        return response.ok;
      } catch (headError) {
        return false;
      }
    }
  }

  /**
   * Verifica la disponibilidad del endpoint con autenticación
   */
  private async checkAuthenticatedEndpoint(endpoint: string, token: string): Promise<boolean> {
    try {
      // En lugar de obtener el token con getAuthToken, lo recibe como parámetro
      // o simplemente puede obtenerlo directamente de localStorage:
      // const token = localStorage.getItem('auth_token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Intentar hacer una petición autenticada
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      clearTimeout(timeoutId);
      
      // Si recibimos 401, podría ser que el token esté caducado
      if (response.status === 401) {
        return false;
      }
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  /**
   * Notifica a todos los listeners sobre cambios en el estado
   */
  private notifyListeners(apiName?: string) {
    for (const listener of this.listeners) {
      if (apiName) {
        listener(this.apiStatus[apiName], apiName, this.authStatus[apiName]);
      } else {
        listener(this.isOnline);
      }
    }
  }

  /**
   * Añade un listener para recibir notificaciones de cambios de estado
   */
  public addListener(callback: (status: boolean, apiName?: string, isAuth?: boolean) => void) {
    this.listeners.push(callback);
    // Notificar inmediatamente con el estado actual
    callback(this.isOnline);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Obtener el estado general de conectividad
   */
  public getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Obtener el estado de una API específica
   */
  public getApiStatus(apiName: string): boolean {
    return this.apiStatus[apiName] || false;
  }

  /**
   * Obtener el estado de autenticación de una API específica
   */
  public getApiAuthStatus(apiName: string): boolean {
    return this.authStatus[apiName] || false;
  }

  /**
   * Verificar todas las APIs
   */
  public async checkAllApis(): Promise<{[key: string]: boolean}> {
    await this.checkAPIAvailability();
    return { ...this.apiStatus };
  }

  /**
   * Forzar una comprobación inmediata de un endpoint específico o todos
   */
  public async forcePing(apiName?: string): Promise<boolean> {
    if (apiName) {
      const endpoint = `/api/${apiName}`;
      await this.checkEndpoint(endpoint);
      return this.apiStatus[apiName] || false;
    } else {
      await this.checkAPIAvailability();
      return this.isOnline;
    }
  }

  /**
   * Obtener información detallada del estado de todas las APIs
   */
  public getDetailedStatus(): {
    online: boolean;
    apis: {[key: string]: { available: boolean, authenticated: boolean }}
  } {
    const apisDetail: {[key: string]: { available: boolean, authenticated: boolean }} = {};
    
    Object.keys(this.apiStatus).forEach(apiName => {
      apisDetail[apiName] = {
        available: this.apiStatus[apiName],
        authenticated: this.authStatus[apiName]
      };
    });
    
    return {
      online: this.isOnline,
      apis: apisDetail
    };
  }

  /**
   * Detener las comprobaciones periódicas
   */
  public stopMonitoring() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reanudar las comprobaciones periódicas
   */
  public resumeMonitoring() {
    if (this.intervalId === null) {
      this.startPeriodicChecks();
    }
  }

  /**
   * Cambiar la frecuencia de comprobación
   */
  public setCheckInterval(interval: number) {
    this.checkInterval = interval;
    this.stopMonitoring();
    this.resumeMonitoring();
  }
}

// Exportar una instancia singleton
export const connectivityService = new ConnectivityService();