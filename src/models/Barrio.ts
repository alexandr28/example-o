// src/models/Barrio.ts - versión corregida

import { Sector } from './';

// Interfaz para la entidad Barrio
export interface Barrio {
  id?: number;
  codBarrio?: number; // Campo adicional que viene de la API
  nombre?: string; // Campo normalizado
  nombreBarrio?: string; // Campo que viene de la API
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