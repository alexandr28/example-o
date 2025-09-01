// src/models/Sector.ts - MODELO ACTUALIZADO
export interface Sector {
  id: number;
  nombre: string;
  cuadrante?: number;
  nombreCuadrante?: string;
  descripcion?: string;
  estado?: boolean | string;  // Puede ser boolean o 'ACTIVO'/'INACTIVO'
  fechaCreacion?: Date | string;
  fechaModificacion?: Date | string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario
export interface SectorFormData {
  nombre: string;
  cuadrante?: number;
  descripcion?: string;
}

// Funciones helper
export const isSectorActivo = (sector: Sector): boolean => {
  if (typeof sector.estado === 'boolean') {
    return sector.estado;
  }
  return sector.estado === 'ACTIVO';
};

export const getSectorDisplayName = (sector: Sector): string => {
  return sector.nombre || `Sector ${sector.id}`;
};