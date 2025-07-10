// src/hooks/useValoresUnitarios.ts
import { useState, useCallback, useEffect } from 'react';
import { 
  ValorUnitario, 
  ValorUnitarioFormData, 
  CategoriaValorUnitario, 
  SubcategoriaValorUnitario, 
  LetraValorUnitario,
  SUBCATEGORIAS_POR_CATEGORIA
} from '../models';
import { valorUnitarioService } from '../services';
import { NotificationService } from '../components/utils/Notification';

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

/**
 * Hook personalizado para la gestión de valores unitarios
 * Conectado con la API real
 */
export const useValoresUnitarios = () => {
  // Estados
  const [valoresUnitarios, setValoresUnitarios] = useState<ValorUnitario[]>([]);
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
      // Limpiar subcategoría seleccionada si no está en las nuevas opciones
      if (subcategoriaSeleccionada && !subcategorias.some(s => s.value === subcategoriaSeleccionada)) {
        setSubcategoriaSeleccionada(null);
      }
    } else {
      setSubcategoriasDisponibles([]);
      setSubcategoriaSeleccionada(null);
    }
  }, [categoriaSeleccionada, subcategoriaSeleccionada]);

  // Cargar valores unitarios desde la API
  const cargarValoresUnitarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const valores = await valorUnitarioService.obtenerTodos();
      setValoresUnitarios(valores);
      
      console.log(`✅ [useValoresUnitarios] ${valores.length} valores cargados`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar los valores unitarios';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
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
      
      if (data.costo <= 0) {
        throw new Error('El costo debe ser mayor a 0');
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
      
      // Crear en la API
      const nuevoValor = await valorUnitarioService.crear({
        anio: data.año,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        letra: data.letra,
        costo: data.costo
      });
      
      // Actualizar estado local
      setValoresUnitarios(prev => [...prev, nuevoValor]);
      
      // Limpiar selecciones (manteniendo año y categoría)
      setSubcategoriaSeleccionada(null);
      setLetraSeleccionada(null);
      
      console.log('✅ [useValoresUnitarios] Valor unitario registrado exitosamente');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al registrar el valor unitario';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
      throw err; // Re-lanzar para que la página pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [valoresUnitarios]);

  // Eliminar un valor unitario
  const eliminarValorUnitario = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Eliminar en la API
      await valorUnitarioService.eliminar(id);
      
      // Actualizar estado local
      setValoresUnitarios(prev => prev.filter(vu => vu.id !== id));
      
      console.log('✅ [useValoresUnitarios] Valor unitario eliminado');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al eliminar el valor unitario';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar todos los valores de un año
  const eliminarValoresPorAnio = useCallback(async (anio: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await valorUnitarioService.eliminarPorAnio(anio);
      
      // Actualizar estado local
      setValoresUnitarios(prev => prev.filter(vu => vu.año !== anio));
      
      console.log(`✅ [useValoresUnitarios] Valores del año ${anio} eliminados`);
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al eliminar valores por año';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener valores unitarios por categoría (para la tabla)
  const obtenerValoresUnitariosPorCategoria = useCallback(async (año: number) => {
    try {
      setLoading(true);
      const valores = await valorUnitarioService.obtenerValoresPorCategoria(año);
      return valores;
    } catch (err) {
      console.error('❌ [useValoresUnitarios] Error al obtener valores por categoría:', err);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar un valor unitario existente
  const actualizarValorUnitario = useCallback(async (id: number, data: Partial<ValorUnitarioFormData>) => {
    try {
      setLoading(true);
      setError(null);
      
      const valorActualizado = await valorUnitarioService.actualizar(id, {
        anio: data.año,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        letra: data.letra,
        costo: data.costo
      });
      
      // Actualizar estado local
      setValoresUnitarios(prev => 
        prev.map(vu => vu.id === id ? valorActualizado : vu)
      );
      
      console.log('✅ [useValoresUnitarios] Valor unitario actualizado');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al actualizar el valor unitario';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estados
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
    
    // Métodos
    cargarValoresUnitarios,
    registrarValorUnitario,
    eliminarValorUnitario,
    eliminarValoresPorAnio,
    actualizarValorUnitario,
    obtenerValoresUnitariosPorCategoria,
    
    // Setters
    setAñoSeleccionado,
    setCategoriaSeleccionada,
    setSubcategoriaSeleccionada,
    setLetraSeleccionada,
  };
};