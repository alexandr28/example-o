// src/services/connectivityService.ts
import { getAuthToken } from '../api/authClient';
import { API_CONFIG, buildApiUrl, getPublicHeaders, getAuthHeaders } from '../config/api.config';

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

  // Usar endpoints desde la configuración
  private apiEndpoints = API_CONFIG.healthCheckEndpoints;

  constructor() {
    console.log('🔧 [ConnectivityService] Inicializado');
    console.log('🌐 [ConnectivityService] API Base URL:', API_CONFIG.baseURL);
    console.log('📍 [ConnectivityService] Endpoints a verificar:', this.apiEndpoints);
    
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
    // Manejar endpoints con subrutas
    if (endpoint.includes('/direccion/')) return 'direccion';
    if (endpoint.includes('/persona/')) return 'persona';
    
    // Para endpoints simples
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Configura los listeners de eventos de red
   */
  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 [ConnectivityService] Conexión a Internet restaurada');
      this.isOnline = true;
      this.checkAPIAvailability();
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      console.log('🚫 [ConnectivityService] Sin conexión a Internet');
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
    });
  }

  /**
   * Inicia las comprobaciones periódicas de disponibilidad
   */
  private startPeriodicChecks() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }

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
      console.warn('❌ [ConnectivityService] Error al comprobar disponibilidad de APIs:', error);
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
    }
  }

  /**
   * Comprueba la disponibilidad de un endpoint específico
   */
  private async checkEndpoint(endpoint: string): Promise<boolean> {
    const apiName = this.getApiNameFromEndpoint(endpoint);
    
    try {
      // APIs que no requieren autenticación (desde configuración)
      const noAuthApis = ['sector', 'via', 'barrio', 'direccion', 'persona'];
      const requiresAuth = !noAuthApis.includes(apiName);
      
      if (!requiresAuth || !navigator.onLine) {
        const isAvailable = await this.checkBasicEndpoint(endpoint);
        this.apiStatus[apiName] = isAvailable;
        this.authStatus[apiName] = isAvailable;
        return isAvailable;
      }
  
      // Para APIs que requieren autenticación
      const token = getAuthToken();
      const isAvailable = await this.checkBasicEndpoint(endpoint);
      this.apiStatus[apiName] = isAvailable;
      
      if (isAvailable && token) {
        const isAuthenticated = await this.checkAuthenticatedEndpoint(endpoint, token);
        this.authStatus[apiName] = isAuthenticated;
      } else {
        this.authStatus[apiName] = false;
      }
      
      this.notifyListeners(apiName);
      return isAvailable;
      
    } catch (error) {
      console.error(`❌ [ConnectivityService] Error al comprobar ${apiName}:`, error);
      this.apiStatus[apiName] = false;
      this.authStatus[apiName] = false;
      this.notifyListeners(apiName);
      return false;
    }
  }

  /**
   * Verifica la disponibilidad básica del endpoint (sin autenticación)
   * Usa la configuración centralizada
   */
  private async checkBasicEndpoint(endpoint: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Usar buildApiUrl de la configuración
      const fullUrl = buildApiUrl(endpoint);
      console.log(`🔍 [ConnectivityService] Verificando endpoint: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: getPublicHeaders(),
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      // Considerar disponible si status es 200-299, 401 o 403
      const isAvailable = response.ok || response.status === 401 || response.status === 403;
      console.log(`${isAvailable ? '✅' : '❌'} [ConnectivityService] ${endpoint}: ${response.status}`);
      
      return isAvailable;
    } catch (error) {
      // Si el GET falla, intentar con HEAD
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const fullUrl = buildApiUrl(endpoint);
        const response = await fetch(fullUrl, {
          method: 'HEAD',
          signal: controller.signal,
          headers: getPublicHeaders(),
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        return response.ok || response.status === 401 || response.status === 403;
      } catch (headError) {
        console.error(`❌ [ConnectivityService] No se pudo conectar a ${endpoint}`);
        return false;
      }
    }
  }

  /**
   * Verifica la disponibilidad del endpoint con autenticación
   */
  private async checkAuthenticatedEndpoint(endpoint: string, token: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Usar buildApiUrl de la configuración
      const fullUrl = buildApiUrl(endpoint);
      console.log(`🔐 [ConnectivityService] Verificando con auth: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: getAuthHeaders(),
        mode: 'cors',
        credentials: 'include'
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        console.warn('⚠️ [ConnectivityService] Token inválido o expirado');
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('❌ [ConnectivityService] Error en verificación autenticada:', error);
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
   * Forzar una comprobación inmediata
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
   * Obtener información detallada del estado
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