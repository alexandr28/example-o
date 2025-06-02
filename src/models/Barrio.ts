// src/models/Barrio.ts - CORREGIDO PARA MANEJAR SECTOR NULL

import { Sector } from './';

// Interfaz para la entidad Barrio
export interface Barrio {
  id?: number;
  codBarrio?: number; // Campo adicional que viene de la API
  nombre?: string; // Campo normalizado
  nombreBarrio?: string; // Campo que viene de la API
  sectorId: number; // ✅ OBLIGATORIO - siempre debe tener un sectorId válido
  sector?: Sector | null; // ✅ PUEDE SER NULL - relación opcional
  estado?: boolean;
  fechaCreacion?: Date | string;
  fechaModificacion?: Date | string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de Barrio
export type BarrioFormData = {
  nombre: string;
  sectorId: number;
};

// ✅ FUNCIONES HELPER PARA MANEJAR BARRIOS
export const getBarrioDisplayName = (barrio: Barrio): string => {
  return barrio.nombre || barrio.nombreBarrio || `Barrio ${barrio.id || 'S/N'}`;
};

export const getBarrioSectorName = (barrio: Barrio, sectores: Sector[] = []): string => {
  if (barrio.sector && barrio.sector.nombre) {
    return barrio.sector.nombre;
  }
  
  const sector = sectores.find(s => s.id === barrio.sectorId);
  return sector?.nombre || `Sector ID: ${barrio.sectorId}`;
};

export const isBarrioValid = (barrio: Barrio): boolean => {
  return !!(
    barrio.sectorId && 
    barrio.sectorId > 0 && 
    (barrio.nombre || barrio.nombreBarrio) && 
    (barrio.nombre || barrio.nombreBarrio)!.trim().length > 0
  );
};

// ✅ CONSTANTES PARA MANEJO DE SECTORES DEFAULT
export const DEFAULT_SECTOR_ID = 1; // ID del sector por defecto para barrios sin sector
export const DEFAULT_SECTOR_NAME = 'Sin Sector Asignado';