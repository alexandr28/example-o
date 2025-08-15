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
import { valorUnitarioService, ValorUnitarioData } from '../services/valorUnitarioService';
import { NotificationService } from '../components/utils/Notification';

// Función para convertir ValorUnitarioData a ValorUnitario
const convertirValorUnitarioData = (data: ValorUnitarioData): ValorUnitario => {
  return {
    id: data.id,
    año: data.año,
    categoria: data.categoria as CategoriaValorUnitario,
    subcategoria: data.subcategoria as SubcategoriaValorUnitario,
    letra: data.letra as LetraValorUnitario,
    costo: data.costo,
    estado: data.estado === 'ACTIVO',
    fechaCreacion: data.fechaRegistro ? new Date(data.fechaRegistro) : undefined,
    fechaModificacion: data.fechaModificacion ? new Date(data.fechaModificacion) : undefined,
    usuarioCreacion: data.codUsuario?.toString(),
    usuarioModificacion: data.codUsuario?.toString()
  };
};

// Generar rangos de años
const generarRangoAnos = (inicio: number, fin: number) => {
  return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
};

// Años disponibles para el selector
const años = generarRangoAnos(1991, 2025).map(año => ({
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

  // Cargar valores unitarios desde la API usando el nuevo método con query params
  const cargarValoresUnitarios = useCallback(async (params?: {
    año?: number;
    categoria?: string;
    subcategoria?: string;
    letra?: string;
    estado?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useValoresUnitarios] Cargando con parámetros:', params);
      
      // Usar el nuevo método que consulta con query params sin autenticación
      const valores = await valorUnitarioService.consultarValoresUnitarios(params || {});
      setValoresUnitarios(valores.map(convertirValorUnitarioData));
      
      console.log(`✅ [useValoresUnitarios] ${valores.length} valores cargados usando nuevo API`);
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
      const nuevoValor = await valorUnitarioService.crearValorUnitario({
        año: data.año,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        letra: data.letra,
        costo: data.costo
      });
      
      // Actualizar estado local
      setValoresUnitarios(prev => [...prev, convertirValorUnitarioData(nuevoValor)]);
      
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
      await valorUnitarioService.eliminarValorUnitario(id);
      
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
      
      await valorUnitarioService.eliminarPorAño(anio);
      
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

  // Buscar valores unitarios con filtros específicos (usando nueva API)
  const buscarValoresUnitarios = useCallback(async (filtros: {
    año?: number;
    categoria?: string;
    subcategoria?: string;
    letra?: string;
    estado?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useValoresUnitarios] Buscando con filtros:', filtros);
      
      const valores = await valorUnitarioService.consultarValoresUnitarios(filtros);
      
      console.log(`✅ [useValoresUnitarios] ${valores.length} valores encontrados`);
      return valores;
    } catch (err: any) {
      const mensaje = err.message || 'Error al buscar valores unitarios';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener valores unitarios por categoría (para la tabla) - usando nuevo API
  const obtenerValoresUnitariosPorCategoria = useCallback(async (año: number) => {
    try {
      setLoading(true);
      
      console.log(`🔍 [useValoresUnitarios] Obteniendo valores para año ${año} usando nuevo API`);
      
      // Usar el nuevo método con query params
      const valores = await valorUnitarioService.consultarValoresUnitarios({ año });
      
      console.log(`📊 [useValoresUnitarios] Recibidos ${valores.length} valores para el año ${año}`);
      
      // Agrupar por subcategoría y letra (para la tabla)
      const resultado: Record<string, Record<string, number>> = {};
      
      valores.forEach(valor => {
        console.log(`🔍 [useValoresUnitarios] Procesando valor:`, valor);
        
        if (!resultado[valor.subcategoria]) {
          resultado[valor.subcategoria] = {};
        }
        resultado[valor.subcategoria][valor.letra] = valor.costo;
      });
      
      console.log(`✅ [useValoresUnitarios] Resultado agrupado para tabla:`, resultado);
      return resultado;
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
      
      const valorActualizado = await valorUnitarioService.actualizarValorUnitario(id, {
        año: data.año,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        letra: data.letra,
        costo: data.costo
      });
      
      // Actualizar estado local
      setValoresUnitarios(prev => 
        prev.map(vu => vu.id === id ? convertirValorUnitarioData(valorActualizado) : vu)
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
    buscarValoresUnitarios,
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