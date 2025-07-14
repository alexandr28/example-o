// src/models/Barrio.ts

/**
 * Modelo principal de Barrio
 */
export interface Barrio {
  id: number;
  nombre: string;
  codSector: number;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

/**
 * Datos del formulario de Barrio
 */
export interface BarrioFormData {
  nombre: string;
  codSector: number;
}

/**
 * Funciones helper
 */
export const isBarrioActivo = (barrio: Barrio): boolean => {
  return barrio.estado === 'ACTIVO';
};

export const getBarrioDisplayName = (barrio: Barrio): string => {
  return barrio.nombre || `Barrio ${barrio.id}`;
};

/**
 * Valores por defecto para un nuevo barrio
 */
export const defaultBarrioFormData: BarrioFormData = {
  nombre: '',
  codSector: 0
};