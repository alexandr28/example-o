// Enumeración para las categorías
export enum CategoriaValorUnitario {
  ESTRUCTURAS = 'Estructuras',
  ACABADOS = 'Acabados',
  INSTALACIONES = 'Instalaciones Eléctricas y Sanitarias'
}

// Enumeración para las subcategorías
export enum SubcategoriaValorUnitario {
  MUROS_Y_COLUMNAS = 'Muros y Columnas',
  TECHOS = 'Techos',
  PISOS = 'Pisos',
  PUERTAS_Y_VENTANAS = 'Puertas y Ventanas',
  REVESTIMIENTOS = 'Revestimientos',
  BANOS = 'Baños',
  INSTALACIONES_ELECTRICAS_Y_SANITARIAS = 'Instalaciones Eléctricas y Sanitarias'
}

// Mapeo de categorías a subcategorías - CORREGIDO según especificación del usuario
export const SUBCATEGORIAS_POR_CATEGORIA = {
  [CategoriaValorUnitario.ESTRUCTURAS]: [
    SubcategoriaValorUnitario.MUROS_Y_COLUMNAS,
    SubcategoriaValorUnitario.TECHOS
  ],
  [CategoriaValorUnitario.ACABADOS]: [
    SubcategoriaValorUnitario.PISOS,           // Movido de ESTRUCTURAS a ACABADOS
    SubcategoriaValorUnitario.PUERTAS_Y_VENTANAS,
    SubcategoriaValorUnitario.REVESTIMIENTOS,
    SubcategoriaValorUnitario.BANOS
  ],
  [CategoriaValorUnitario.INSTALACIONES]: [
    SubcategoriaValorUnitario.INSTALACIONES_ELECTRICAS_Y_SANITARIAS
  ]
};

// Enumeración para las letras (calidad)
export enum LetraValorUnitario {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I'
}

// Interfaz para la entidad ValorUnitario
export interface ValorUnitario {
  id: number;
  año: number;
  categoria: CategoriaValorUnitario;
  subcategoria: SubcategoriaValorUnitario;
  letra: LetraValorUnitario;
  costo: number;
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de ValorUnitario
export type ValorUnitarioFormData = {
  año: number;
  categoria: CategoriaValorUnitario;
  subcategoria: SubcategoriaValorUnitario;
  letra: LetraValorUnitario;
  costo: number;
};