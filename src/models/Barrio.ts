import { Sector } from './';

// Interfaz para la entidad Barrio
export interface Barrio {
  id: number;
  nombre: string;
  sectorId: number;
  sector?: Sector;
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de Barrio
export type BarrioFormData = {
  nombre: string;
  sectorId: number;
};