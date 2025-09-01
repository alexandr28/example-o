import { useState, useCallback, useEffect } from 'react';
import { Depreciacion, Material, Antiguedad, DepreciacionPaginacionOptions } from '../models/Depreciacion';
import { depreciacionService, DepreciacionFormattedData, CrearDepreciacionDTO } from '../services/depreciacionService';
import { NotificationService } from '../components/utils/Notification';

// Función para convertir DepreciacionFormattedData a Depreciacion del modelo
const convertirDepreciacionData = (data: DepreciacionFormattedData): Depreciacion => {
  return {
    id: data.id,
    anio: data.anio,
    tipoCasa: data.tipoCasa,
    material: data.material as Material,
    antiguedad: data.antiguedad as Antiguedad,
    porcMuyBueno: data.porcMuyBueno,
    porcBueno: data.porcBueno,
    porcRegular: data.porcRegular,
    porcMalo: data.porcMalo,
    estado: data.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO',
    fechaCreacion: data.fechaRegistro ? new Date(data.fechaRegistro) : undefined,
    fechaModificacion: data.fechaModificacion ? new Date(data.fechaModificacion) : undefined
  };
};

/**
 * Hook personalizado para la gestión de datos de Depreciación
 * Conectado con la API real usando depreciacionService
 * 
 * Proporciona funcionalidades para listar, crear y actualizar valores de depreciación
 */
export const useDepreciacion = () => {
  // Estados
  const [depreciaciones, setDepreciaciones] = useState<Depreciacion[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(new Date().getFullYear());
  const [tipoCasaSeleccionado, setTipoCasaSeleccionado] = useState<string | null>('0501');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState<DepreciacionPaginacionOptions>({
    pagina: 1,
    porPagina: 10,
    total: 0
  });

  // Lista de años disponibles
  const [aniosDisponibles, setAniosDisponibles] = useState<{ value: string, label: string }[]>([]);
  
  // Lista de tipos de casa disponibles - ELIMINADO: ahora se carga en el componente con useClasificacionPredio

  // Cargar datos iniciales
  useEffect(() => {
    cargarAniosDisponibles();
    // cargarTiposCasa(); // ELIMINADO: ahora se carga en el componente con useClasificacionPredio
  }, []);

  // Cargar depreciaciones usando la API real
  const cargarDepreciaciones = useCallback(async (params?: {
    anio?: number;
    codTipoCasa?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useDepreciacion] Cargando depreciaciones con parámetros:', params);
      
      // Usar el servicio real para consultar depreciaciones
      const depreciacionesData = await depreciacionService.consultarDepreciaciones({
        anio: params?.anio || anioSeleccionado || undefined,
        codTipoCasa: params?.codTipoCasa || tipoCasaSeleccionado || undefined || undefined
      });
      
      // Convertir los datos del servicio al modelo local
      const depreciacionesConvertidas = depreciacionesData.map(convertirDepreciacionData);
      
      setDepreciaciones(depreciacionesConvertidas);
      setPaginacion(prev => ({
        ...prev,
        total: depreciacionesConvertidas.length
      }));
      
      console.log(`✅ [useDepreciacion] ${depreciacionesConvertidas.length} depreciaciones cargadas`);
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar valores de depreciación';
      setError(mensaje);
      console.error('❌ [useDepreciacion] Error:', err);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado || undefined, tipoCasaSeleccionado || undefined]);

  // Cargar años disponibles desde el servicio
  const cargarAniosDisponibles = useCallback(async () => {
    try {
      console.log('🔍 [useDepreciacion] Cargando años disponibles');
      
      const anios = await depreciacionService.obtenerAniosDisponibles();
      setAniosDisponibles(anios);
      
      console.log('✅ [useDepreciacion] Años disponibles cargados:', anios);
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar años disponibles';
      setError(mensaje);
      console.error('❌ [useDepreciacion] Error cargando años:', err);
    }
  }, []);

  // Cargar tipos de casa desde el servicio - ELIMINADO: ahora se carga en el componente con useClasificacionPredio
  // const cargarTiposCasa = useCallback(async () => { ... }, []);

  // Manejar cambio de año
  const handleAnioChange = useCallback((anio: number | null) => {
    setAnioSeleccionado(anio);
  }, []);

  // Manejar cambio de tipo de casa
  const handleTipoCasaChange = useCallback((tipoCasa: string | null) => {
    setTipoCasaSeleccionado(tipoCasa);
  }, []);

  // Registrar nueva depreciación usando la API real
  const registrarDepreciacion = useCallback(async (datosFormulario?: any) => {
    if (!anioSeleccionado || !tipoCasaSeleccionado || undefined) {
      const mensaje = 'Debe seleccionar un año y un tipo de casa';
      setError(mensaje);
      NotificationService.error(mensaje);
      return;
    }
    
    // Validar que tenemos los datos de estados de conservación
    if (!datosFormulario?.estadosConservacion) {
      const mensaje = 'Debe configurar los estados de conservación';
      setError(mensaje);
      NotificationService.error(mensaje);
      return;
    }

    // Validar que tenemos los nuevos campos requeridos
    if (!datosFormulario?.nivelAntiguedad) {
      const mensaje = 'Debe seleccionar un nivel de antigüedad';
      setError(mensaje);
      NotificationService.error(mensaje);
      return;
    }

    if (!datosFormulario?.materialEstructural) {
      const mensaje = 'Debe seleccionar un material estructural';
      setError(mensaje);
      NotificationService.error(mensaje);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useDepreciacion] Registrando depreciación:', {
        anio: anioSeleccionado || undefined,
        codTipoCasa: tipoCasaSeleccionado || undefined,
        datos: datosFormulario
      });
      
      // Construir el DTO según el formato requerido por la API
      const dto: CrearDepreciacionDTO = {
        codDepreciacion: null, // Se asigna por SQL
        codDepreciacionAnterior: null, // Se asigna por SQL
        anio: anioSeleccionado.toString(),
        codTipoCasa: tipoCasaSeleccionado || undefined,
        codNivelAntiguedad: datosFormulario.nivelAntiguedad, // Valor real del formulario
        codMaterialEstructural: datosFormulario.materialEstructural, // Valor real del formulario
        muyBueno: datosFormulario.estadosConservacion.porcMuyBueno || 0,
        bueno: datosFormulario.estadosConservacion.porcBueno || 0,
        regular: datosFormulario.estadosConservacion.porcRegular || 0,
        malo: datosFormulario.estadosConservacion.porcMalo || 0,
        nivelAntiguedad: null,
        materialEstructural: null
      };
      
      console.log('📦 [useDepreciacion] DTO construido:', dto);
      
      // Crear usando el servicio real sin autenticación
      await depreciacionService.crearDepreciacion(dto);
      
      NotificationService.success('Depreciación registrada exitosamente');
      
      // Recargar las depreciaciones después de registrar
      await cargarDepreciaciones({
        anio: anioSeleccionado || undefined,
        codTipoCasa: tipoCasaSeleccionado || undefined
      });
      
      console.log('✅ [useDepreciacion] Depreciación registrada exitosamente');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al registrar depreciación';
      setError(mensaje);
      console.error('❌ [useDepreciacion] Error registrando:', err);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado || undefined, tipoCasaSeleccionado || undefined, cargarDepreciaciones]);

  // Buscar depreciaciones usando la API real
  const buscarDepreciaciones = useCallback(async () => {
    if (!anioSeleccionado || !tipoCasaSeleccionado || undefined) {
      const mensaje = 'Debe seleccionar un año y un tipo de casa para buscar';
      setError(mensaje);
      NotificationService.warning(mensaje);
      return;
    }
    
    try {
      console.log('🔍 [useDepreciacion] Buscando depreciaciones');
      console.log('📊 [useDepreciacion] Parámetros de búsqueda:', {
        anio: anioSeleccionado || undefined,
        codTipoCasa: tipoCasaSeleccionado || undefined
      });
      
      await cargarDepreciaciones({
        anio: anioSeleccionado || undefined,
        codTipoCasa: tipoCasaSeleccionado || undefined
      });
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al buscar depreciaciones';
      setError(mensaje);
      console.error('❌ [useDepreciacion] Error buscando:', err);
      NotificationService.error(mensaje);
    }
  }, [anioSeleccionado || undefined, tipoCasaSeleccionado || undefined, cargarDepreciaciones]);

  // Actualizar depreciación usando la API real
  const actualizarDepreciacion = useCallback(async (id: number, datos: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 [useDepreciacion] Actualizando depreciación:', id, datos);
      
      await depreciacionService.actualizarDepreciacion(id, datos);
      
      NotificationService.success('Depreciación actualizada exitosamente');
      
      // Recargar las depreciaciones después de actualizar
      await cargarDepreciaciones({
        anio: anioSeleccionado || undefined,
        codTipoCasa: tipoCasaSeleccionado || undefined
      });
      
      console.log('✅ [useDepreciacion] Depreciación actualizada exitosamente');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al actualizar depreciación';
      setError(mensaje);
      console.error('❌ [useDepreciacion] Error actualizando:', err);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado || undefined, tipoCasaSeleccionado || undefined, cargarDepreciaciones]);

  // Eliminar depreciación usando la API real
  const eliminarDepreciacion = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useDepreciacion] Eliminando depreciación:', id);
      
      await depreciacionService.eliminarDepreciacion(id);
      
      NotificationService.success('Depreciación eliminada exitosamente');
      
      // Recargar las depreciaciones después de eliminar
      await cargarDepreciaciones({
        anio: anioSeleccionado || undefined,
        codTipoCasa: tipoCasaSeleccionado || undefined
      });
      
      console.log('✅ [useDepreciacion] Depreciación eliminada exitosamente');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al eliminar depreciación';
      setError(mensaje);
      console.error('❌ [useDepreciacion] Error eliminando:', err);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado || undefined, tipoCasaSeleccionado || undefined, cargarDepreciaciones]);

  // Cambiar página de la lista
  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setPaginacion(prev => ({
      ...prev,
      pagina: nuevaPagina
    }));
  }, []);

  // Obtener elementos de la página actual
  const obtenerElementosPaginados = useCallback(() => {
    const inicio = (paginacion.pagina - 1) * paginacion.porPagina;
    const fin = inicio + paginacion.porPagina;
    return depreciaciones.slice(inicio, fin);
  }, [depreciaciones, paginacion]);

  return {
    // Estados
    depreciaciones: obtenerElementosPaginados(),
    todasLasDepreciaciones: depreciaciones, // Todas las depreciaciones sin paginar
    totalDepreciaciones: depreciaciones.length,
    aniosDisponibles,
    // tiposCasa, // ELIMINADO: ahora se carga en el componente con useClasificacionPredio
    anioSeleccionado,
    tipoCasaSeleccionado,
    paginacion,
    loading,
    error,
    
    // Métodos
    cargarDepreciaciones,
    buscarDepreciaciones,
    registrarDepreciacion,
    actualizarDepreciacion,
    eliminarDepreciacion,
    handleAnioChange,
    handleTipoCasaChange,
    cambiarPagina
  };
};

export default useDepreciacion;