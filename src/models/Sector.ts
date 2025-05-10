// Interfaz para la entidad Sector
export interface Sector {
  id: number;
  nombre: string;
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de Sector
export type SectorFormData = Omit<Sector, 'id' | 'estado' | 'fechaCreacion' | 'fechaModificacion' | 'usuarioCreacion' | 'usuarioModificacion'>;