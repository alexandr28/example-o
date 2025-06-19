// src/types/direccionTypes.ts

export interface DireccionSeleccionadaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDireccion: (direccion: Direccion) => void;
  direcciones?: Direccion[];
}

// Esta interfaz debe coincidir con la estructura de la API
export interface Direccion {
  id: number;
  codDireccion?: number;
  descripcion: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  
  // Campos adicionales de la API
  sectorId?: number;
  barrioId?: number;
  calleId?: number;
  cuadra?: string;
  estado?: boolean;
  
  // Nombres descriptivos
  nombreSector?: string;
  nombreBarrio?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  
  // Códigos originales de la API
  codSector?: number;
  codBarrio?: number;
  codVia?: number;
  codBarrioVia?: number;
  
  // Campos opcionales
  parametroBusqueda?: string;
  codUsuario?: number;
}