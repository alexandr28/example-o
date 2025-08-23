// src/hooks/usePersonas.ts
import { useState, useCallback, useRef } from 'react';
import { 
  personaService, 
  PersonaData, 
  CreatePersonaAPIDTO, 
  BusquedaPersonaParams,
  TIPO_PERSONA_CODES 
} from '../services/personaService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Hook personalizado para gestión de personas
 */
export const usePersonas = () => {
  // Estados principales
  const [personas, setPersonas] = useState<PersonaData[]>([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<PersonaData | null>(null);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [loadingActualizar, setLoadingActualizar] = useState(false);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  
  // Estados de error
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda
  const [ultimaBusqueda, setUltimaBusqueda] = useState<BusquedaPersonaParams | null>(null);
  
  // Ref para evitar cargas duplicadas
  const cargaInicialRef = useRef(false);

  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cargar todas las personas
   */
  const cargarPersonas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [usePersonas] Cargando todas las personas');
      
      const personasData = await personaService.obtenerTodas();
      
      console.log(`✅ [usePersonas] ${personasData.length} personas cargadas`);
      setPersonas(personasData);
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al cargar personas:', error);
      setError(error.message || 'Error al cargar personas');
      NotificationService.error('Error al cargar personas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar personas por parámetros
   */
  const buscarPersonas = useCallback(async (parametros: BusquedaPersonaParams) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [usePersonas] Buscando personas con parámetros:', parametros);
      
      let personasData: PersonaData[] = [];
      
      // Si hay parámetro de búsqueda, usar listarPorTipoYNombre
      if (parametros.parametroBusqueda || parametros.codTipoPersona) {
        personasData = await personaService.listarPorTipoYNombre(parametros);
      } else if (parametros.numeroDocumento) {
        personasData = await personaService.buscarPorDocumento(parametros.numeroDocumento);
      } else {
        personasData = await personaService.obtenerTodas();
      }
      
      console.log(`✅ [usePersonas] ${personasData.length} personas encontradas`);
      setPersonas(personasData);
      setUltimaBusqueda(parametros);
      
      return personasData;
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error en búsqueda:', error);
      setError(error.message || 'Error al buscar personas');
      NotificationService.error('Error al buscar personas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar personas para contribuyente
   */
  const buscarPersonasContribuyente = useCallback(async (parametros: BusquedaPersonaParams) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [usePersonas] Buscando personas para contribuyente:', parametros);
      
      const personasData = await personaService.listarPorContribuyente(parametros);
      
      console.log(`✅ [usePersonas] ${personasData.length} personas encontradas para contribuyente`);
      setPersonas(personasData);
      setUltimaBusqueda(parametros);
      
      return personasData;
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error en búsqueda para contribuyente:', error);
      setError(error.message || 'Error al buscar personas para contribuyente');
      NotificationService.error('Error al buscar personas para contribuyente');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar persona por número de documento
   */
  const buscarPorDocumento = useCallback(async (numeroDocumento: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [usePersonas] Buscando por documento:', numeroDocumento);
      
      const personasData = await personaService.buscarPorDocumento(numeroDocumento);
      
      if (personasData.length > 0) {
        console.log(`✅ [usePersonas] Persona encontrada por documento: ${numeroDocumento}`);
        setPersonaSeleccionada(personasData[0]);
        return personasData[0];
      } else {
        console.log(`⚠️ [usePersonas] No se encontró persona con documento: ${numeroDocumento}`);
        setPersonaSeleccionada(null);
        return null;
      }
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al buscar por documento:', error);
      setError(error.message || 'Error al buscar por documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener persona por código
   */
  const obtenerPersonaPorCodigo = useCallback(async (codPersona: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 [usePersonas] Obteniendo persona con código: ${codPersona}`);
      
      const persona = await personaService.obtenerPorCodigo(codPersona);
      
      if (persona) {
        console.log('✅ [usePersonas] Persona obtenida por código');
        setPersonaSeleccionada(persona);
        return persona;
      } else {
        console.log(`⚠️ [usePersonas] No se encontró persona con código: ${codPersona}`);
        setPersonaSeleccionada(null);
        return null;
      }
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al obtener persona por código:', error);
      setError(error.message || 'Error al obtener persona');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva persona usando API directa
   */
  const crearPersona = useCallback(async (datos: CreatePersonaAPIDTO): Promise<PersonaData | null> => {
    try {
      setLoadingCrear(true);
      setError(null);
      
      console.log('➕ [usePersonas] Creando nueva persona:', datos);
      
      // Validar datos requeridos
      if (!datos.numerodocumento || !datos.nombres) {
        throw new Error('Número de documento y nombres son requeridos');
      }
      
      const nuevaPersona = await personaService.crearPersonaAPI(datos);
      
      console.log('✅ [usePersonas] Persona creada exitosamente:', nuevaPersona);
      
      // Actualizar la lista local si ya hay personas cargadas
      setPersonas(prev => [nuevaPersona, ...prev]);
      setPersonaSeleccionada(nuevaPersona);
      
      NotificationService.success('Persona creada correctamente');
      return nuevaPersona;
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al crear persona:', error);
      setError(error.message || 'Error al crear persona');
      NotificationService.error(error.message || 'Error al crear persona');
      return null;
    } finally {
      setLoadingCrear(false);
    }
  }, []);

  /**
   * Verificar si existe persona por documento
   */
  const verificarPersonaExistente = useCallback(async (numeroDocumento: string): Promise<PersonaData | null> => {
    try {
      console.log('🔍 [usePersonas] Verificando persona existente:', numeroDocumento);
      
      return await personaService.verificarPersonaExistente(numeroDocumento);
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error verificando persona existente:', error);
      return null;
    }
  }, []);

  /**
   * Crear persona desde datos de formulario con verificación de duplicados
   */
  const crearPersonaDesdeFormulario = useCallback(async (datosFormulario: any): Promise<PersonaData | null> => {
    try {
      setLoadingCrear(true);
      setError(null);
      
      console.log('➕ [usePersonas] Creando persona desde formulario:', datosFormulario);
      
      // Primero verificar si ya existe
      const numeroDocumento = datosFormulario.numeroDocumento;
      if (numeroDocumento) {
        const personaExistente = await verificarPersonaExistente(numeroDocumento);
        
        if (personaExistente) {
          console.log('⚠️ [usePersonas] Persona ya existe, usando existente:', personaExistente);
          NotificationService.info(`Persona con documento ${numeroDocumento} ya existe. Usando datos existentes.`);
          setPersonaSeleccionada(personaExistente);
          return personaExistente;
        }
      }
      
      // Convertir datos del formulario al formato API
      const datosAPI = personaService.convertirFormularioAApiDTO(datosFormulario);
      
      console.log('📋 [usePersonas] Datos convertidos para API:', datosAPI);
      
      return await crearPersona(datosAPI);
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al crear persona desde formulario:', error);
      setError(error.message || 'Error al crear persona');
      NotificationService.error(error.message || 'Error al crear persona');
      return null;
    } finally {
      setLoadingCrear(false);
    }
  }, [crearPersona, verificarPersonaExistente]);

  /**
   * Actualizar persona existente
   */
  const actualizarPersona = useCallback(async (codPersona: number, datos: any): Promise<PersonaData | null> => {
    try {
      setLoadingActualizar(true);
      setError(null);
      
      console.log('📝 [usePersonas] Actualizando persona:', codPersona, datos);
      
      const personaActualizada = await personaService.actualizarPersona(codPersona, datos);
      
      console.log('✅ [usePersonas] Persona actualizada exitosamente');
      
      // Actualizar la lista local
      setPersonas(prev => prev.map(p => 
        p.codPersona === codPersona ? personaActualizada : p
      ));
      
      if (personaSeleccionada?.codPersona === codPersona) {
        setPersonaSeleccionada(personaActualizada);
      }
      
      NotificationService.success('Persona actualizada correctamente');
      return personaActualizada;
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al actualizar persona:', error);
      setError(error.message || 'Error al actualizar persona');
      NotificationService.error(error.message || 'Error al actualizar persona');
      return null;
    } finally {
      setLoadingActualizar(false);
    }
  }, [personaSeleccionada]);

  /**
   * Eliminar persona
   */
  const eliminarPersona = useCallback(async (codPersona: number): Promise<boolean> => {
    try {
      setLoadingEliminar(true);
      setError(null);
      
      console.log('🗑️ [usePersonas] Eliminando persona:', codPersona);
      
      await personaService.eliminarPersona(codPersona);
      
      console.log('✅ [usePersonas] Persona eliminada exitosamente');
      
      // Actualizar la lista local
      setPersonas(prev => prev.filter(p => p.codPersona !== codPersona));
      
      if (personaSeleccionada?.codPersona === codPersona) {
        setPersonaSeleccionada(null);
      }
      
      NotificationService.success('Persona eliminada correctamente');
      return true;
      
    } catch (error: any) {
      console.error('❌ [usePersonas] Error al eliminar persona:', error);
      setError(error.message || 'Error al eliminar persona');
      NotificationService.error(error.message || 'Error al eliminar persona');
      return false;
    } finally {
      setLoadingEliminar(false);
    }
  }, [personaSeleccionada]);

  /**
   * Recargar datos usando la última búsqueda
   */
  const recargarDatos = useCallback(async () => {
    if (ultimaBusqueda) {
      await buscarPersonas(ultimaBusqueda);
    } else {
      await cargarPersonas();
    }
  }, [ultimaBusqueda, buscarPersonas, cargarPersonas]);

  /**
   * Filtrar personas localmente
   */
  const filtrarPersonasLocalmente = useCallback((termino: string): PersonaData[] => {
    if (!termino.trim()) return personas;
    
    const terminoLower = termino.toLowerCase();
    return personas.filter(persona => 
      persona.nombrePersona?.toLowerCase().includes(terminoLower) ||
      persona.numerodocumento?.toLowerCase().includes(terminoLower) ||
      persona.nombres?.toLowerCase().includes(terminoLower) ||
      persona.apellidopaterno?.toLowerCase().includes(terminoLower) ||
      persona.apellidomaterno?.toLowerCase().includes(terminoLower) ||
      persona.razonSocial?.toLowerCase().includes(terminoLower)
    );
  }, [personas]);

  /**
   * Validar documento
   */
  const validarDocumento = useCallback((tipoDocumento: string, numeroDocumento: string) => {
    return personaService.validarDocumento(tipoDocumento, numeroDocumento);
  }, []);

  /**
   * Obtener personas por tipo
   */
  const obtenerPersonasPorTipo = useCallback((tipoPersona: keyof typeof TIPO_PERSONA_CODES): PersonaData[] => {
    const codigo = TIPO_PERSONA_CODES[tipoPersona];
    return personas.filter(persona => persona.codTipopersona === codigo);
  }, [personas]);

  /**
   * Convertir persona a contribuyente
   */
  const convertirAContribuyente = useCallback((persona: PersonaData) => {
    return personaService.convertirAContribuyente(persona);
  }, []);

  return {
    // Datos
    personas,
    personaSeleccionada,
    ultimaBusqueda,
    
    // Estados
    loading,
    loadingCrear,
    loadingActualizar,
    loadingEliminar,
    error,
    
    // Funciones de búsqueda
    cargarPersonas,
    buscarPersonas,
    buscarPersonasContribuyente,
    buscarPorDocumento,
    obtenerPersonaPorCodigo,
    
    // Funciones CRUD
    crearPersona,
    crearPersonaDesdeFormulario,
    actualizarPersona,
    eliminarPersona,
    
    // Utilidades
    recargarDatos,
    filtrarPersonasLocalmente,
    validarDocumento,
    obtenerPersonasPorTipo,
    convertirAContribuyente,
    verificarPersonaExistente,
    limpiarError,
    setPersonaSeleccionada,
    
    // Constantes
    TIPO_PERSONA_CODES
  };
};

export default usePersonas;