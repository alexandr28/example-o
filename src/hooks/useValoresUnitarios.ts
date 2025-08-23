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
  const [añoSeleccionado, setAñoSeleccionado] = useState<number | null>(new Date().getFullYear());
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaValorUnitario | null>(null);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<SubcategoriaValorUnitario | null>(null);
  const [letraSeleccionada, setLetraSeleccionada] = useState<LetraValorUnitario | null>(null);
  
  // Subcategorías disponibles basadas en la categoría seleccionada
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<{ value: string, label: string }[]>([]);

  // Actualizar subcategorías disponibles cuando cambia la categoría seleccionada
  useEffect(() => {
    if (categoriaSeleccionada) {
      console.log('🔍 [useValoresUnitarios] Categoría seleccionada:', categoriaSeleccionada);
      console.log('🔍 [useValoresUnitarios] SUBCATEGORIAS_POR_CATEGORIA keys:', Object.keys(SUBCATEGORIAS_POR_CATEGORIA));
      
      // IMPORTANTE: Mapear el valor readable a la clave del enum
      let claveCategoria: CategoriaValorUnitario;
      
      // Mapear nombres legibles a claves del enum
      switch (categoriaSeleccionada) {
        case 'Estructuras':
          claveCategoria = CategoriaValorUnitario.ESTRUCTURAS;
          break;
        case 'Acabados':
          claveCategoria = CategoriaValorUnitario.ACABADOS;
          break;
        case 'Instalaciones Eléctricas y Sanitarias':
          claveCategoria = CategoriaValorUnitario.INSTALACIONES;
          break;
        default:
          console.warn('⚠️ [useValoresUnitarios] Categoría no reconocida:', categoriaSeleccionada);
          setSubcategoriasDisponibles([]);
          setSubcategoriaSeleccionada(null);
          return;
      }
      
      console.log('🔍 [useValoresUnitarios] Clave de categoría mapeada:', claveCategoria);
      
      // Obtener subcategorías usando la clave correcta
      const subcategoriasArray = SUBCATEGORIAS_POR_CATEGORIA[claveCategoria];
      
      if (subcategoriasArray && Array.isArray(subcategoriasArray)) {
        const subcategorias = subcategoriasArray.map(subcategoria => ({
          value: subcategoria,
          label: subcategoria
        }));
        
        console.log('✅ [useValoresUnitarios] Subcategorías cargadas para', claveCategoria, ':', subcategorias);
        setSubcategoriasDisponibles(subcategorias);
        
        // Limpiar subcategoría seleccionada si no está en las nuevas opciones
        if (subcategoriaSeleccionada && !subcategorias.some(s => s.value === subcategoriaSeleccionada)) {
          setSubcategoriaSeleccionada(null);
        }
      } else {
        console.warn('⚠️ [useValoresUnitarios] No se encontraron subcategorías para:', claveCategoria);
        setSubcategoriasDisponibles([]);
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

  // Registrar un nuevo valor unitario usando la nueva API sin autenticación
  const registrarValorUnitario = useCallback(async (data: ValorUnitarioFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 [useValoresUnitarios] Iniciando registro de valor unitario:', data);
      
      // LOGGING ESPECIAL para subcategorías de ACABADOS
      if (['Pisos', 'Puertas y Ventanas', 'Revestimientos', 'Baños'].includes(data.subcategoria)) {
        console.log('🚨 [useValoresUnitarios] *** REGISTRO DE SUBCATEGORÍA DE ACABADOS ***');
        console.log('🚨 [useValoresUnitarios] Categoría recibida:', data.categoria);
        console.log('🚨 [useValoresUnitarios] Subcategoría recibida:', data.subcategoria);
        console.log('🚨 [useValoresUnitarios] Letra recibida:', data.letra);
        console.log('🚨 [useValoresUnitarios] Costo recibido:', data.costo);
      }
      
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
      
      // Mapear los códigos a los valores esperados por la API
      // IMPORTANTE: Mapear los valores del formulario a códigos numéricos del API
      const mapearCategoria = (categoria: string): string => {
        // Si ya viene como código numérico, retornarlo
        if (/^\d+$/.test(categoria)) {
          return categoria;
        }
        
        console.log('🔍 [useValoresUnitarios] Mapeando categoría recibida:', `"${categoria}"`);
        
        // Mapear TANTO nombres legibles COMO constantes a códigos
        const mapeo: Record<string, string> = {
          // Nombres legibles del enum
          'Estructuras': '1001',
          'Acabados': '1002',
          'Instalaciones Eléctricas y Sanitarias': '1003',
          
          // Nombres de constantes (por compatibilidad)
          'ESTRUCTURAS': '1001',
          'ACABADOS': '1002',
          'INSTALACIONES': '1003'
        };
        
        // LOGGING ESPECIAL para detectar problemas de mapeo de categorías
        if (categoria === 'Acabados' || categoria === 'ACABADOS') {
          console.log('🚨 [useValoresUnitarios] DEBUGGING categoría ACABADOS:', categoria, '-> código:', mapeo[categoria]);
          console.log('🚨 [useValoresUnitarios] Mapeos de categoría disponibles:', Object.keys(mapeo));
        }
        
        const codigo = mapeo[categoria];
        console.log('📝 [useValoresUnitarios] Categoría mapeada:', `"${categoria}" -> "${codigo}"`);
        
        return codigo || '1001';
      };

      const mapearSubcategoria = (subcategoria: string): string => {
        // Si ya viene como código numérico, retornarlo
        if (/^\d+$/.test(subcategoria)) {
          return subcategoria;
        }
        
        console.log('🔍 [useValoresUnitarios] Mapeando subcategoría recibida:', `"${subcategoria}"`);
        
        // Mapear TANTO nombres legibles COMO constantes a códigos
        // IMPORTANTE: Códigos corregidos según estructura del API
        const mapeo: Record<string, string> = {
          // Nombres legibles del enum (como vienen del formulario)
          'Muros y Columnas': '100101',
          'Techos': '100102',
          'Pisos': '100201',                    // CORREGIDO: Pisos usa código 100201
          'Puertas y Ventanas': '100202',       // CORREGIDO: Puertas y Ventanas usa código 100202  
          'Revestimientos': '100203',           // CORREGIDO: Revestimientos usa código 100203
          'Baños': '100204',                    // CORREGIDO: Baños usa código 100204
          'Instalaciones Eléctricas y Sanitarias': '100301',
          
          // Nombres de constantes (por compatibilidad) - CÓDIGOS CORREGIDOS
          'MUROS_Y_COLUMNAS': '100101',
          'MUROS Y COLUMNAS': '100101',
          'TECHOS': '100102',
          'PISOS': '100201',                    // CORREGIDO
          'PUERTAS_Y_VENTANAS': '100202',       // CORREGIDO
          'PUERTAS Y VENTANAS': '100202',       // CORREGIDO
          'REVESTIMIENTOS': '100203',           // CORREGIDO
          'BANOS': '100204',                    // CORREGIDO
          'BAÑOS': '100204',                    // CORREGIDO
          'INSTALACIONES_ELECTRICAS_Y_SANITARIAS': '100301',
          'INSTALACIONES ELECTRICAS Y SANITARIAS': '100301'
        };
        
        const codigo = mapeo[subcategoria];
        console.log('📝 [useValoresUnitarios] Subcategoría mapeada:', `"${subcategoria}" -> "${codigo}"`);
        
        // LOGGING ESPECIAL para subcategorías de ACABADOS
        if (['Pisos', 'Puertas y Ventanas', 'Revestimientos', 'Baños'].includes(subcategoria)) {
          console.log('🚨 [useValoresUnitarios] DEBUGGING subcategoría ACABADOS:', subcategoria, '-> código:', codigo);
          console.log('🚨 [useValoresUnitarios] Mapeos de subcategoría disponibles:', Object.keys(mapeo));
        }
        
        if (!codigo) {
          console.warn('⚠️ [useValoresUnitarios] Subcategoría no encontrada en mapeo:', subcategoria);
          console.warn('⚠️ [useValoresUnitarios] Mapeos disponibles:', Object.keys(mapeo));
        }
        
        return codigo || '100101';
      };

      const mapearLetra = (letra: string): string => {
        // Si ya viene como código numérico, retornarlo
        if (/^\d+$/.test(letra)) {
          return letra;
        }
        
        console.log('🔍 [useValoresUnitarios] Mapeando letra recibida:', `"${letra}"`);
        
        // Mapear letras a códigos
        const mapeo: Record<string, string> = {
          'A': '1101',
          'B': '1102',
          'C': '1103',
          'D': '1104',
          'E': '1105',
          'F': '1106',
          'G': '1107',
          'H': '1108',
          'I': '1109'
        };
        
        const codigo = mapeo[letra];
        console.log('📝 [useValoresUnitarios] Letra mapeada:', `"${letra}" -> "${codigo}"`);
        
        return codigo || '1101';
      };

      const codigoCategoria = mapearCategoria(data.categoria);
      const codigoSubcategoria = mapearSubcategoria(data.subcategoria);
      const codigoLetra = mapearLetra(data.letra);
      
      console.log('🔄 [useValoresUnitarios] Mapeando datos para API:', {
        anio: data.año,
        codCategoria: codigoCategoria,
        codSubcategoria: codigoSubcategoria,
        codLetra: codigoLetra,
        costo: data.costo
      });

      // LOGGING ESPECIAL para Puertas y Ventanas y Baños
      if (data.subcategoria === 'Puertas y Ventanas' || data.subcategoria === 'Baños') {
        console.log('🚨 [useValoresUnitarios] DEBUGGING ESPECIAL para:', data.subcategoria);
        console.log('🚨 [useValoresUnitarios] Datos originales del formulario:', data);
        console.log('🚨 [useValoresUnitarios] Categoría mapeada:', codigoCategoria);
        console.log('🚨 [useValoresUnitarios] Subcategoría mapeada:', codigoSubcategoria);
        console.log('🚨 [useValoresUnitarios] Letra mapeada:', codigoLetra);
      }

      // Verificar duplicados en la API antes de crear
      console.log('🔍 [useValoresUnitarios] Verificando duplicados en la API...');
      
      try {
        // Consultar la API para verificar si ya existe
        const valoresExistentes = await valorUnitarioService.consultarValoresUnitarios({
          año: data.año
        });
        
        console.log('📋 [useValoresUnitarios] Valores existentes para validación:', valoresExistentes.length);
        
        // Verificar duplicados comparando los códigos del API
        const existeRegistro = valoresExistentes.some(
          vu => vu.año === data.año && 
                vu.categoria === codigoCategoria && 
                vu.subcategoria === codigoSubcategoria && 
                vu.letra === codigoLetra
        );
        
        if (existeRegistro) {
          throw new Error(`Ya existe un registro para ${data.categoria}/${data.subcategoria}/${data.letra} en el año ${data.año}`);
        }
        
        console.log('✅ [useValoresUnitarios] No hay duplicados, procediendo con el registro');
      } catch (err: any) {
        if (err.message.includes('Ya existe')) {
          throw err;
        }
        console.warn('⚠️ [useValoresUnitarios] Error verificando duplicados, continuando:', err);
      }
      
      // Crear el DTO asegurando que los códigos automáticos sean null
      const dtoParaCrear = {
        codigoValorUnitario: null, // SIEMPRE null - SQL lo asigna
        codigoValorUnitarioAnterior: null, // SIEMPRE null - SQL lo asigna
        anio: data.año,
        codLetra: codigoLetra,
        codCategoria: codigoCategoria,
        codSubcategoria: codigoSubcategoria,
        costo: data.costo
      };

      // LOGGING ESPECIAL para verificar códigos corregidos de ACABADOS
      if (['Pisos', 'Puertas y Ventanas', 'Revestimientos', 'Baños'].includes(data.subcategoria)) {
        console.log('🚨 [useValoresUnitarios] *** CÓDIGOS CORREGIDOS PARA ACABADOS ***');
        console.log('🚨 [useValoresUnitarios] DTO a enviar:', JSON.stringify(dtoParaCrear, null, 2));
        console.log('🚨 [useValoresUnitarios] Subcategoría:', data.subcategoria, '-> Código API:', codigoSubcategoria);
      }

      console.log('📦 [useValoresUnitarios] DTO final para crear (códigos como null):', dtoParaCrear);
      
      // Crear en la API usando el nuevo método sin autenticación
      const nuevoValor = await valorUnitarioService.crearValorUnitarioSinAuth(dtoParaCrear);
      
      // Actualizar estado local inmediatamente
      setValoresUnitarios(prev => [...prev, convertirValorUnitarioData(nuevoValor)]);
      
      // Recargar datos de la API para asegurar sincronización
      try {
        console.log('🔄 [useValoresUnitarios] Recargando datos después del registro...');
        await cargarValoresUnitarios({ año: data.año });
        console.log('✅ [useValoresUnitarios] Datos recargados exitosamente');
      } catch (err) {
        console.warn('⚠️ [useValoresUnitarios] Error recargando datos:', err);
      }
      
      // Limpiar selecciones (manteniendo año y categoría)
      setSubcategoriaSeleccionada(null);
      setLetraSeleccionada(null);
      
      console.log('✅ [useValoresUnitarios] Valor unitario registrado exitosamente usando API sin autenticación');
      
      // Mostrar notificación de éxito
      NotificationService.success(`Valor unitario para ${data.subcategoria}/${data.letra} registrado exitosamente`);
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al registrar el valor unitario';
      setError(mensaje);
      console.error('❌ [useValoresUnitarios] Error:', err);
      
      // Mostrar notificación de error
      NotificationService.error(mensaje);
      
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
      console.log(`🔍 [useValoresUnitarios] Tipo de año recibido:`, typeof año, 'Valor:', año);
      
      // Validar que el año sea válido antes de enviarlo
      if (!año || año <= 0) {
        console.error(`❌ [useValoresUnitarios] Año inválido recibido:`, año);
        return {};
      }
      
      // Crear el objeto de parámetros
      const params = { año };
      console.log(`📤 [useValoresUnitarios] Enviando parámetros al servicio:`, params);
      
      // Usar el nuevo método con query params
      const valores = await valorUnitarioService.consultarValoresUnitarios(params);
      
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
  }, [setLoading]);

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