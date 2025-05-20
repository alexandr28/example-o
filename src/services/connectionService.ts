/**
 * Servicio para verificar el estado de conexión con varias APIs del sistema
 * Realiza pruebas de ping y guarda resultados de conectividad
 */

// URLs de prueba para verificar la conectividad a diferentes servicios
const API_HEALTH_ENDPOINTS = {
  sectores: 'http://localhost:8080/api/sectores/health',
  contribuyentes: 'http://localhost:8080/api/contribuyentes/health',
  direcciones: 'http://localhost:8080/api/direccion/health',
  default: 'http://localhost:8080/api/health'
};

// Estado de conexión para diferentes servicios
interface ConnectionStatus {
  online: boolean;        // Estado de conexión general a Internet
  apiAvailable: boolean;  // Estado de la API en general
  services: {             // Estado de servicios específicos
    [key: string]: boolean;
  };
  lastCheck: number;      // Timestamp de la última comprobación
}

// Intervalo de tiempo para considerar una comprobación como válida (5 minutos)
const STATUS_VALIDITY_MS = 5 * 60 * 1000;

class ConnectionService {
  private static instance: ConnectionService;
  private status: ConnectionStatus;
  
  private constructor() {
    // Inicializar estado de conexión
    this.status = {
      online: navigator.onLine,
      apiAvailable: false,
      services: {},
      lastCheck: 0
    };
    
    // Configurar event listeners para detectar cambios en la conexión
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  // Implementación del patrón Singleton
  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }
  
  // Manejador para el evento 'online'
  private handleOnline() {
    this.status.online = true;
    // Al recuperar la conexión a Internet, verificamos inmediatamente el estado de la API
    this.checkApiAvailability();
  }
  
  // Manejador para el evento 'offline'
  private handleOffline() {
    this.status.online = false;
    this.status.apiAvailable = false;
    // Actualizar timestamp de última comprobación
    this.status.lastCheck = Date.now();
  }
  
  // Comprobar la disponibilidad de la API
  public async checkApiAvailability(forceCheck = false): Promise<boolean> {
    // Si no hay conexión a Internet, la API no está disponible
    if (!this.status.online) {
      return false;
    }
    
    // Si ya hemos comprobado recientemente y no es una comprobación forzada, devolver el estado almacenado
    const now = Date.now();
    if (!forceCheck && (now - this.status.lastCheck) < STATUS_VALIDITY_MS) {
      return this.status.apiAvailable;
    }
    
    try {
      // Intentar hacer ping al endpoint de salud por defecto
      const response = await fetch(API_HEALTH_ENDPOINTS.default, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Añadir timeout para evitar esperas largas
        signal: AbortSignal.timeout(5000)
      });
      
      this.status.apiAvailable = response.ok;
      this.status.lastCheck = now;
      
      return this.status.apiAvailable;
    } catch (error) {
      console.error('Error al comprobar disponibilidad de API:', error);
      this.status.apiAvailable = false;
      this.status.lastCheck = now;
      
      return false;
    }
  }
  
  // Comprobar la disponibilidad de un servicio específico
  public async checkServiceAvailability(service: string, forceCheck = false): Promise<boolean> {
    // Si no hay conexión a Internet o la API no está disponible, el servicio no está disponible
    if (!this.status.online) {
      return false;
    }
    
    // Comprobar primero si la API general está disponible
    const apiAvailable = await this.checkApiAvailability(forceCheck);
    if (!apiAvailable) {
      return false;
    }
    
    // Si ya hemos comprobado recientemente y no es una comprobación forzada, devolver el estado almacenado
    const now = Date.now();
    if (!forceCheck && 
        this.status.services[service] !== undefined && 
        (now - this.status.lastCheck) < STATUS_VALIDITY_MS) {
      return this.status.services[service];
    }
    
    // Si no existe un endpoint específico para este servicio, usar el general
    const endpoint = API_HEALTH_ENDPOINTS[service] || API_HEALTH_ENDPOINTS.default;
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Añadir timeout para evitar esperas largas
        signal: AbortSignal.timeout(5000)
      });
      
      this.status.services[service] = response.ok;
      
      return this.status.services[service];
    } catch (error) {
      console.error(`Error al comprobar disponibilidad del servicio ${service}:`, error);
      this.status.services[service] = false;
      
      return false;
    } finally {
      this.status.lastCheck = now;
    }
  }
  
  // Obtener el estado actual de conexión
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.status };
  }
  
  // Verificar si la Internet está disponible
  public isOnline(): boolean {
    return this.status.online;
  }
  
  // Verificar si la API está disponible
  public isApiAvailable(): boolean {
    return this.status.apiAvailable;
  }
  
  // Verificar si un servicio específico está disponible
  public isServiceAvailable(service: string): boolean {
    return this.status.services[service] || false;
  }
}

export default ConnectionService;