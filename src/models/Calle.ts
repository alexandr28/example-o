// src/models/Calle.ts - ACTUALIZADO CON SECTOR Y BARRIO
export enum TipoVia {
  AVENIDA = 'avenida',
  CALLE = 'calle',
  JIRON = 'jiron',
  PASAJE = 'pasaje',
  MALECON = 'malecon',
  PLAZA = 'plaza',
  PARQUE = 'parque'
}

// Interfaz para opciones del select de tipo de vía
export interface TipoViaOption {
  value: string;
  label: string;
  descripcion?: string;
}

// Lista de opciones para el select de tipo de vía
export const TIPO_VIA_OPTIONS: TipoViaOption[] = [
  { value: TipoVia.AVENIDA, label: 'Avenida', descripcion: 'Av.' },
  { value: TipoVia.CALLE, label: 'Calle', descripcion: 'Calle' },
  { value: TipoVia.JIRON, label: 'Jirón', descripcion: 'Jr.' },
  { value: TipoVia.PASAJE, label: 'Pasaje', descripcion: 'Psje.' },
  { value: TipoVia.MALECON, label: 'Malecón', descripcion: 'Malecón' },
  { value: TipoVia.PLAZA, label: 'Plaza', descripcion: 'Plaza' },
  { value: TipoVia.PARQUE, label: 'Parque', descripcion: 'Parque' }
];

// Interfaz para la entidad Calle
export interface Calle {
  id?: number;
  codTipoVia?: number;
  tipoVia: string;
  nombre: string;
  nombreVia?: string;
  descripTipoVia?: string;
  
  // NUEVOS CAMPOS
  sectorId: number;
  barrioId: number;
  sector?: any; // Para la relación con sector
  barrio?: any; // Para la relación con barrio
  
  estado?: boolean;
  fechaCreacion?: string | Date;
  fechaModificacion?: string | Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de Calle - ACTUALIZADO
export type CalleFormData = {
  sectorId: number;
  barrioId: number;
  tipoVia: string;
  nombre: string;
};

// Funciones de utilidad
export const formatearNombreCalle = (calle: Calle): string => {
  const tipoViaOption = TIPO_VIA_OPTIONS.find(opt => opt.value === calle.tipoVia);
  const prefijo = tipoViaOption?.descripcion || '';
  
  return prefijo ? `${prefijo} ${calle.nombre}` : calle.nombre;
};

export const getDescripcionTipoVia = (tipoVia: string): string => {
  const option = TIPO_VIA_OPTIONS.find(opt => opt.value === tipoVia);
  return option?.descripcion || tipoVia;
};

export const isValidTipoVia = (tipoVia: string): boolean => {
  return TIPO_VIA_OPTIONS.some(opt => opt.value === tipoVia);
};

export const normalizeTipoViaFromApi = (apiTipoVia: string): string => {
  if (!apiTipoVia) return TipoVia.CALLE;
  
  const normalized = apiTipoVia.toLowerCase().trim();
  
  const mappings: Record<string, string> = {
    'av': TipoVia.AVENIDA,
    'avenida': TipoVia.AVENIDA,
    'avenue': TipoVia.AVENIDA,
    'calle': TipoVia.CALLE,
    'street': TipoVia.CALLE,
    'jiron': TipoVia.JIRON,
    'jirón': TipoVia.JIRON,
    'jr': TipoVia.JIRON,
    'pasaje': TipoVia.PASAJE,
    'psje': TipoVia.PASAJE,
    'passage': TipoVia.PASAJE,
    'malecon': TipoVia.MALECON,
    'malecón': TipoVia.MALECON,
    'plaza': TipoVia.PLAZA,
    'square': TipoVia.PLAZA,
    'parque': TipoVia.PARQUE,
    'park': TipoVia.PARQUE
  };
  
  return mappings[normalized] || normalized;
};