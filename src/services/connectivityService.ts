// src/services/connectivityService.ts
class ConnectivityService {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(status: boolean) => void> = [];
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 segundos

  constructor() {
    this.setupEventListeners();
    this.checkAPIAvailability();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.checkAPIAvailability();
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });

    // Verificar periódicamente la disponibilidad de la API
    setInterval(() => this.checkAPIAvailability(), this.checkInterval);
  }

  private async checkAPIAvailability() {
    if (!navigator.onLine) {
      this.isOnline = false;
      return;
    }

    // Evitar verificaciones demasiado frecuentes
    const now = Date.now();
    if (now - this.lastCheck < this.checkInterval) return;
    this.lastCheck = now;

    try {
      // Usar el API_URL actual en lugar de un endpoint de health
      // Esto usará el proxy configurado en vite.config.ts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Intentar acceder a los sectores a través del proxy para evitar CORS
      const response = await fetch('/api/sectores', {
        method: 'HEAD',
        signal: controller.signal,
        // No incluir credenciales para evitar preflight
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      this.isOnline = response.ok;
    } catch (error) {
      console.warn('API no disponible:', error);
      this.isOnline = false;
    }

    this.notifyListeners();
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.isOnline);
    }
  }

  public addListener(callback: (status: boolean) => void) {
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

  public async forcePing(): Promise<boolean> {
    await this.checkAPIAvailability();
    return this.isOnline;
  }
}

// Exportar una instancia singleton
export const connectivityService = new ConnectivityService();