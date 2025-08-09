// src/models/Piso.ts

import { 
  Material, 
  Antiguedad, 
  EstadoConservacion 
} from './Depreciacion';
import { 
  SubcategoriaValorUnitario, 
  LetraValorUnitario 
} from './ValorUnitario';

/**
 * Enumeración para formas de registro
 */
export enum FormaRegistro {
  INDIVIDUAL = 'INDIVIDUAL',
  MASIVO = 'MASIVO'
}

/**
 * Interfaz para representar las categorías de construcción con sus valores
 */
export interface CategoriaConstruccion {
  categoria: string;
  murosColumnas: LetraValorUnitario | null;
  techo: LetraValorUnitario | null;
  pisos: LetraValorUnitario | null;
  revestimiento: LetraValorUnitario | null;
  puertasVentanas: LetraValorUnitario | null;
  instalacionesElectricasSanitarias: LetraValorUnitario | null;
}

/**
 * Interfaz para la entidad Piso
 */
export interface Piso {
  id?: number;
  
  // Relación con predio
  predioId: number;
  predio?: any; // Se puede tipear con la interfaz Predio
  
  // Datos del piso
  item?: number; // Número de item en la lista
  descripcion: string;
  fechaConstruccion: Date | string;
  antiguedad: Antiguedad;
  estadoConservacion: EstadoConservacion;
  areaConstruida: number;
  
  // Material predominante
  materialPredominante: Material;
  
  // Forma de registro
  formaRegistro: FormaRegistro;
  
  // Categorías de construcción
  categoriasMurosColumnas?: LetraValorUnitario;
  categoriaTecho?: LetraValorUnitario;
  categoriaPisos?: LetraValorUnitario;
  categoriaRevestimiento?: LetraValorUnitario;
  categoriaPuertasVentanas?: LetraValorUnitario;
  categoriaInstalacionesElectricasSanitarias?: LetraValorUnitario;
  
  // Valores calculados
  valorUnitario?: number;
  incremento?: number; // Incremento del 5%
  porcentajeDepreciacion?: number;
  valorUnicoDepreciado?: number;
  valorAreaConstruida?: number;
  
  // Otras instalaciones
  otrasInstalaciones?: number;
  
  // Valores totales
  valorConstruccion?: number;
  valorDepreciado?: number;
  
  // Auditoría
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

/**
 * Tipo para el formulario de Piso
 */
export interface PisoFormData {
  descripcion: string;
  fechaConstruccion: Date | string;
  antiguedad: Antiguedad | string;
  estadoConservacion: EstadoConservacion | string;
  areaConstruida: number;
  materialPredominante: Material | string;
  formaRegistro: FormaRegistro;
  otrasInstalaciones?: number;
  
  // Categorías opcionales
  categoriasMurosColumnas?: LetraValorUnitario | string;
  categoriaTecho?: LetraValorUnitario | string;
  categoriaPisos?: LetraValorUnitario | string;
  categoriaRevestimiento?: LetraValorUnitario | string;
  categoriaPuertasVentanas?: LetraValorUnitario | string;
  categoriaInstalacionesElectricasSanitarias?: LetraValorUnitario | string;
}

/**
 * Interfaz para los datos de la tabla de categorías
 */
export interface TablaCategorias {
  categorias: CategoriaConstruccion[];
}