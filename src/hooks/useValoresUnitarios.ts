import { useState, useCallback, useEffect } from 'react';
import { 
  ValorUnitario, 
  ValorUnitarioFormData, 
  CategoriaValorUnitario, 
  SubcategoriaValorUnitario, 
  LetraValorUnitario,
  SUBCATEGORIAS_POR_CATEGORIA
} from '../models';

// Generar rangos de años
const generarRangoAnos = (inicio: number, fin: number) => {
  return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
};

// Años disponibles para el selector
const años = generarRangoAnos(1991, 2030).map(año => ({
  value: año.toString(),
  label: año.toString()
}));

// Categorías para el selector
const categorias = Object.values(CategoriaValorUnitario).map(categoria => ({
  value: categoria,
  label: categoria
}));

// Letras para el selector
const letras = Object.values(LetraValorUnitario).map(letra => ({
  value: letra,
  label: letra
}));

// Datos de ejemplo para pruebas
const generateValoresUnitariosIniciales = (): ValorUnitario[] => {
  const valoresUnitarios: ValorUnitario[] = [];
  const año = 2025;
  let id = 1;

  // Para cada categoría y subcategoría, generar valores para cada letra
  Object.entries(SUBCATEGORIAS_POR_CATEGORIA).forEach(([categoria, subcategorias]) => {
    subcategorias.forEach(subcategoria => {
      Object.values(LetraValorUnitario).forEach(letra => {
        valoresUnitarios.push({
          id: id++,
          año,
          categoria: categoria as CategoriaValorUnitario,
          subcategoria,
          letra,
          costo: 0.00
        });
      });
    });
  });

  return valoresUnitarios;
};

const valoresUnitariosIniciales = generateValoresUnitariosIniciales();

/**
 * Hook personalizado para la gestión de valores unitarios
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar valores unitarios
 */
export const useValoresUnitarios = () => {
  // Estados
  const [valoresUnitarios, setValoresUnitarios] = useState<ValorUnitario[]>(valoresUnitariosIniciales);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de selección y filtrado
  const [añoSeleccionado, setAñoSeleccionado] = useState<number | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaValorUnitario | null>(null);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<SubcategoriaValorUnitario | null>(null);
  const [letraSeleccionada, setLetraSeleccionada] = useState<LetraValorUnitario | null>(null);
  
  // Subcategorías disponibles basadas en la categoría seleccionada
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<{ value: string, label: string }[]>([]);

  // Actualizar subcategorías disponibles cuando cambia la categoría seleccionada
  useEffect(() => {
    if (categoriaSeleccionada) {
      const subcategorias = SUBCATEGORIAS_POR_CATEGORIA[categoriaSeleccionada].map(subcategoria => ({
        value: subcategoria,
        label: subcategoria
      }));
      setSubcategoriasDisponibles(subcategorias);
    } else {
      setSubcategoriasDisponibles([]);
    }
  }, [categoriaSeleccionada]);

  // Cargar valores unitarios (simula una petición a API)
  const cargarValoresUnitarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API
      // const response = await fetch('/api/valores-unitarios');
      // const data = await response.json();
      // setValoresUnitarios(data);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setValoresUnitarios(valoresUnitariosIniciales);
    } catch (err) {
      setError('Error al cargar los valores unitarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar un nuevo valor unitario
  const registrarValorUnitario = useCallback(async (data: ValorUnitarioFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validaciones básicas
      if (!data.año) {
        throw new Error('Debe seleccionar un año');
      }
      
      if (!data.categoria) {
        throw new Error('Debe seleccionar una categoría');
      }
      
      if (!data.subcategoria) {
        throw new Error('Debe seleccionar una subcategoría');
      }
      
      if (!data.letra) {
        throw new Error('Debe seleccionar una letra');
      }
      
      // Verificar si ya existe un registro con los mismos criterios
      const existeRegistro = valoresUnitarios.some(
        vu => vu.año === data.año && 
              vu.categoria === data.categoria && 
              vu.subcategoria === data.subcategoria && 
              vu.letra === data.letra
      );
      
      if (existeRegistro) {
        throw new Error('Ya existe un registro con los mismos criterios');
      }
      
      // Aquí iría la petición a la API para crear
      // const response = await fetch('/api/valores-unitarios', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const nuevoValorUnitario = await response.json();
      
      // Simulamos la creación con un ID nuevo
      const nuevoValorUnitario: ValorUnitario = {
        id: Math.max(0, ...valoresUnitarios.map(vu => vu.id)) + 1,
        ...data
      };
      
      // Actualizar estado local
      setValoresUnitarios(prev => [...prev, nuevoValorUnitario]);
      
      // Resetear selecciones
      setAñoSeleccionado(null);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setLetraSeleccionada(null);
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar el valor unitario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [valoresUnitarios]);

  // Eliminar un valor unitario
  const eliminarValorUnitario = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API para eliminar
      // await fetch(`/api/valores-unitarios/${id}`, {
      //   method: 'DELETE',
      // });
      
      // Actualizar estado local
      setValoresUnitarios(prev => prev.filter(vu => vu.id !== id));
      
    } catch (err) {
      setError('Error al eliminar el valor unitario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener valores unitarios por categoría
  const obtenerValoresUnitariosPorCategoria = useCallback((año?: number) => {
    // Filtrar por año si se proporciona
    let filtrados = valoresUnitarios;
    if (año) {
      filtrados = filtrados.filter(vu => vu.año === año);
    }
    
    // Agrupar por subcategoria y letra
    const resultado: Record<string, Record<string, number>> = {};
    
    // Inicializar todas las subcategorías
    const todasSubcategorias = [
      SubcategoriaValorUnitario.MUROS_Y_COLUMNAS,
      SubcategoriaValorUnitario.TECHOS,
      SubcategoriaValorUnitario.PISOS,
      SubcategoriaValorUnitario.PUERTAS_Y_VENTANAS,
      SubcategoriaValorUnitario.REVESTIMIENTOS,
      SubcategoriaValorUnitario.INSTALACIONES_ELECTRICAS_Y_SANITARIAS
    ];
    
    // Inicializar la estructura del resultado
    todasSubcategorias.forEach(subcategoria => {
      resultado[subcategoria] = {};
      
      // Inicializar todas las letras para cada subcategoría
      Object.values(LetraValorUnitario).forEach(letra => {
        resultado[subcategoria][letra] = 0.00;
      });
    });
    
    // Poblar con datos reales
    filtrados.forEach(vu => {
      if (resultado[vu.subcategoria]) {
        resultado[vu.subcategoria][vu.letra] = vu.costo;
      }
    });
    
    return resultado;
  }, [valoresUnitarios]);

  return {
    valoresUnitarios,
    años,
    categorias,
    subcategoriasDisponibles,
    letras,
    añoSeleccionado,
    categoriaSeleccionada,
    subcategoriaSeleccionada,
    letraSeleccionada,
    loading,
    error,
    cargarValoresUnitarios,
    registrarValorUnitario,
    eliminarValorUnitario,
    obtenerValoresUnitariosPorCategoria,
    setAñoSeleccionado,
    setCategoriaSeleccionada,
    setSubcategoriaSeleccionada,
    setLetraSeleccionada,
  };
};