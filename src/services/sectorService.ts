import { Sector, SectorFormData } from '../models/Sector';
import { authGet, authPost, authPut, authDelete } from '../api/authClient';

// URL base para la API de sectores
const API_URL = 'http://localhost:8080/api/sectores';

// Clave para almacenar cambios pendientes en localStorage
const PENDING_CHANGES_KEY = 'pending_sectors_changes';

// Tipo para cambios pendientes
export type PendingChange = {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  id?: number;
  data?: SectorFormData;
  tempId?: number;  // ID temporal para nuevos elementos creados en modo offline
  timestamp: number;
};

/**
 * Servicio centralizado para operaciones con sectores
 * Proporciona métodos para gestionar operaciones CRUD y sincronizar cambios offline
 */
export class SectorService {
  // Obtener todos los sectores
  static async getAll(): Promise<Sector[]> {
    try {
      const response = await authGet(API_URL);
      return response;
    } catch (error) {
      console.error('Error al obtener sectores:', error);
      throw error;
    }
  }

  // Obtener un sector por ID
  static async getById(id: number): Promise<Sector> {
    try {
      const response = await authGet(`${API_URL}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener sector ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo sector
  static async create(data: SectorFormData): Promise<Sector> {
    try {
      const response = await authPost(API_URL, data);
      return response;
    } catch (error) {
      console.error('Error al crear sector:', error);
      throw error;
    }
  }

  // Actualizar un sector existente
  static async update(id: number, data: SectorFormData): Promise<Sector> {
    try {
      const response = await authPut(`${API_URL}/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error al actualizar sector ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un sector
  static async delete(id: number): Promise<void> {
    try {
      await authDelete(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Error al eliminar sector ID ${id}:`, error);
      throw error;
    }
  }

  // MÉTODOS PARA GESTIÓN DE CAMBIOS OFFLINE

  // Cargar cambios pendientes del localStorage
  static loadPendingChanges(): PendingChange[] {
    try {
      const storedChanges = localStorage.getItem(PENDING_CHANGES_KEY);
      if (storedChanges) {
        return JSON.parse(storedChanges) as PendingChange[];
      }
      return [];
    } catch (error) {
      console.error("Error al cargar cambios pendientes:", error);
      return [];
    }
  }

  // Guardar cambios pendientes en localStorage
  static savePendingChanges(changes: PendingChange[]): void {
    try {
      localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(changes));
    } catch (error) {
      console.error("Error al guardar cambios pendientes:", error);
    }
  }

  // Añadir un cambio pendiente
  static addPendingChange(change: PendingChange): void {
    const currentChanges = this.loadPendingChanges();
    const updatedChanges = [...currentChanges, change];
    this.savePendingChanges(updatedChanges);
  }

  // Quitar un cambio pendiente
  static removePendingChange(index: number): void {
    const currentChanges = this.loadPendingChanges();
    if (index >= 0 && index < currentChanges.length) {
      currentChanges.splice(index, 1);
      this.savePendingChanges(currentChanges);
    }
  }

  // Sincronizar todos los cambios pendientes
  static async syncPendingChanges(): Promise<{ success: boolean, failedChanges: PendingChange[] }> {
    const pendingChanges = this.loadPendingChanges();
    
    if (pendingChanges.length === 0) {
      return { success: true, failedChanges: [] };
    }

    // Ordenar cambios por timestamp
    const sortedChanges = [...pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
    const failedChanges: PendingChange[] = [];

    // Procesar cada cambio secuencialmente
    for (let i = 0; i < sortedChanges.length; i++) {
      const change = sortedChanges[i];
      
      try {
        switch (change.type) {
          case 'CREATE':
            if (change.data) {
              await this.create(change.data);
            }
            break;
          case 'UPDATE':
            if (change.id && change.data) {
              await this.update(change.id, change.data);
            }
            break;
          case 'DELETE':
            if (change.id) {
              await this.delete(change.id);
            }
            break;
        }
      } catch (error) {
        console.error(`Error al sincronizar cambio ${change.type}:`, error);
        failedChanges.push(change);
      }
    }

    // Actualizar lista de cambios pendientes con solo los que fallaron
    this.savePendingChanges(failedChanges);

    return { 
      success: failedChanges.length === 0, 
      failedChanges 
    };
  }

  // Comprobar el estado de la conexión
  static isOnline(): boolean {
    return window.navigator.onLine;
  }
}

export default SectorService;