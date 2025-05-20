class ConnectivityService {
  private isOnline: boolean = navigator.onLine;
  private apiStatus: { [key: string]: boolean } = {};
  private listeners: Array<(status: boolean, apiName?: string) => void> = [];
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 segundos

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
  }

  private initializeApiStatus() {
    this.apiEndpoints.forEach(endpoint => {
      const apiName = this.getApiNameFromEndpoint(endpoint);
      this.apiStatus[apiName] = false;
    });
  }

  private getApiNameFromEndpoint(endpoint: string): string {
    // Extrae el nombre de la API del endpoint (e.g., '/api/via' -> 'via')
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.checkAPIAvailability();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
    });

    // Verificar periódicamente la disponibilidad de las APIs
    setInterval(() => this.checkAPIAvailability(), this.checkInterval);
  }

  private updateAllApiStatus(status: boolean) {
    Object.keys(this.apiStatus).forEach(apiName => {
      this.apiStatus[apiName] = status;
    });
  }

  private async checkAPIAvailability() {
    if (!navigator.onLine) {
      this.isOnline = false;
      this.updateAllApiStatus(false);
      this.notifyListeners();
      return;
    }

    // Evitar verificaciones demasiado frecuentes
    const now = Date.now();
    if (now - this.lastCheck < this.checkInterval) return;
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

  private async checkEndpoint(endpoint: string): Promise<void> {
    const apiName = this.getApiNameFromEndpoint(endpoint);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Intentar hacer una petición HEAD al endpoint
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      this.apiStatus[apiName] = response.ok;
      
      // Notificar específicamente sobre este cambio de API
      this.notifyListeners(apiName);
    } catch (error) {
      console.warn(`API ${apiName} no disponible:`, error);
      this.apiStatus[apiName] = false;
      
      // Notificar específicamente sobre este cambio de API
      this.notifyListeners(apiName);
    }
  }

  private notifyListeners(apiName?: string) {
    for (const listener of this.listeners) {
      if (apiName) {
        listener(this.apiStatus[apiName], apiName);
      } else {
        listener(this.isOnline);
      }
    }
  }

  public addListener(callback: (status: boolean, apiName?: string) => void) {
    this.listeners.push(callback);
    // Notificar inmediatamente con el estado actual
    callback(this.isOnline);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public getApiStatus(apiName: string): boolean {
    return this.apiStatus[apiName] || false;
  }

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
}

// Exportar una instancia singleton
export const connectivityService = new ConnectivityService();