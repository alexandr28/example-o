// Enumeración para tipos de vía
export enum TipoVia {
  AVENIDA = 'avenida',
  CALLE = 'calle',
  JIRON = 'jiron',
  PASAJE = 'pasaje',
  MALECON = 'malecon',
  PLAZA = 'plaza',
  PARQUE = 'parque'
}

// Interfaz para la entidad Calle
export interface Calle {
  id: number;
  tipoVia: TipoVia | string;
  nombre: string;
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de Calle
export type CalleFormData = Omit<Calle, 'id' | 'estado' | 'fechaCreacion' | 'fechaModificacion' | 'usuarioCreacion' | 'usuarioModificacion'>;

// Funciones de utilidad para calles
export const formatearNombreCalle = (calle: Calle): string => {
  let prefijo = '';
  
  switch (calle.tipoVia) {
    case TipoVia.AVENIDA:
      prefijo = 'Av. ';
      break;
    case TipoVia.JIRON:
      prefijo = 'Jr. ';
      break;
    case TipoVia.CALLE:
      prefijo = 'Calle ';
      break;
    case TipoVia.PASAJE:
      prefijo = 'Psje. ';
      break;
    case TipoVia.MALECON:
      prefijo = 'Malecón ';
      break;
    case TipoVia.PLAZA:
      prefijo = 'Plaza ';
      break;
    case TipoVia.PARQUE:
      prefijo = 'Parque ';
      break;
    default:
      prefijo = '';
  }
  
  return `${prefijo}${calle.nombre}`;
};