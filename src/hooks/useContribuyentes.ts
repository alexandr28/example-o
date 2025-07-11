// src/hooks/useContribuyentes.ts
import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '../components/utils/Notification';
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';
import { contribuyenteService } from '../services/contribuyenteService';

/**
 * Interface para el item de lista de contribuyente
 */
export interface ContribuyenteListItem {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica';
}

/**
 * Interface para filtros de búsqueda
 */
export interface FiltroContribuyente {
  tipoContribuyente?: string;
  busqueda?: string;
  tipoDocumento?: string;
}

/**
 * Datos mock de contribuyentes para cuando no hay autenticación
 */
const CONTRIBUYENTES_MOCK: ContribuyenteListItem[] = [
  {
    codigo: 1,
    contribuyente: "Ramos Mendez Juan Carlos",
    documento: "70300207",
    direccion: "Sector Norte Barrio Nuevo Horizonte CALLE Calle Las Orquídeas Lote 45 Mz A",
    telefono: "987654321",
    tipoPersona: 'natural'
  },
  {
    codigo: 2,
    contribuyente: "Miñano Torres Silvia",
    documento: "18086133",
    direccion: "Av. España 123, Trujillo",
    telefono: "999888777",
    tipoPersona: 'natural'
  },
  {
    codigo: 3,
    contribuyente: "Mantilla Rodriguez Alfonzo",
    documento: "18104765",
    direccion: "Jr. Pizarro 456, Centro Histórico",
    telefono: "944555666",
    tipoPersona: 'natural'
  },
  {
    codigo: 4,
    contribuyente: "Empresa Constructora ABC S.A.C.",
    documento: "20123456789",
    direccion: "Av. Industrial 1234, Parque Industrial",
    telefono: "044-123456",
    tipoPersona: 'juridica'
  },
  {
    codigo: 5,
    contribuyente: "Comercial Los Andes E.I.R.L.",
    documento: "20987654321",
    direccion: "Av. Larco 890, Trujillo",
    telefono: "044-987654",
    tipoPersona: 'juridica'
  }
];

/**
 * Hook híbrido para gestionar contribuyentes
 * Intenta usar datos reales si hay autenticación, si no usa mock
 */
export const useContribuyentes = () => {
  const [contribuyentes, setContribuyentes] = useState<ContribuyenteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usandoDatosMock, setUsandoDatosMock] = useState(true);
  const [yaIntentoCarga, setYaIntentoCarga] = useState(false);
  
  /**
   * Verifica si hay token de autenticación
   */
  const tieneAutenticacion = useCallback(() => {
    const token = localStorage.getItem('auth_token') || 
                 sessionStorage.getItem('auth_token') ||
                 localStorage.getItem('token') ||
                 sessionStorage.getItem('token');
    return !!token;
  }, []);
  
  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (persona: any): ContribuyenteListItem => {
    // Si viene del endpoint de personas
    if (persona.nombrePersona) {
      return {
        codigo: persona.codPersona,
        contribuyente: persona.nombrePersona,
        documento: persona.numerodocumento || 'Sin documento',
        direccion: persona.direccion === 'null' ? 'Sin dirección' : (persona.direccion || 'Sin dirección'),
        telefono: persona.telefono || '',
        tipoPersona: persona.codTipopersona === '0301' ? 'natural' : 'juridica'
      };
    }
    
    // Si viene del endpoint de contribuyentes
    const nombreCompleto = [
      persona.apellidopaterno,
      persona.apellidomaterno,
      persona.nombres
    ].filter(Boolean).join(' ') || persona.nombrePersona || 'Sin nombre';
    
    return {
      codigo: persona.codContribuyente || persona.codPersona,
      contribuyente: nombreCompleto,
      documento: persona.numerodocumento || 'Sin documento',
      direccion: persona.direccion || 'Sin dirección',
      telefono: persona.telefono || '',
      tipoPersona: persona.codTipopersona === '0301' ? 'natural' : 'juridica'
    };
  };
  
  /**
   * Intenta cargar datos reales del API
   */
  const cargarDatosReales = async (): Promise<ContribuyenteListItem[] | null> => {
    try {
      console.log('🔄 [useContribuyentes] Intentando cargar datos reales...');
      
      // Si hay token, intentar con el servicio de contribuyentes
      if (tieneAutenticacion()) {
        console.log('🔑 [useContribuyentes] Token encontrado, usando servicio de contribuyentes...');
        
        try {
          const response = await fetch(buildApiUrl('/api/contribuyente'), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
            }
          });
          
          console.log('📥 [useContribuyentes] Respuesta:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('✅ [useContribuyentes] Datos obtenidos del servicio de contribuyentes');
              return Array.isArray(data.data) ? data.data.map(convertirAListItem) : [];
            }
          } else if (response.status === 403 || response.status === 401) {
            console.log('⚠️ [useContribuyentes] Sin autorización, token inválido');
            // Limpiar token inválido
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('❌ [useContribuyentes] Error al obtener contribuyentes:', error);
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ [useContribuyentes] Error al cargar datos reales:', error);
      return null;
    }
  };
  
  /**
   * Carga todos los contribuyentes (reales o mock)
   */
  const cargarContribuyentes = useCallback(async () => {
    // Evitar cargas múltiples
    if (loading || yaIntentoCarga) {
      console.log('⏭️ [useContribuyentes] Carga ya en proceso o completada, omitiendo...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setYaIntentoCarga(true);
      
      // Intentar cargar datos reales primero
      const datosReales = await cargarDatosReales();
      
      if (datosReales && datosReales.length > 0) {
        // Usar datos reales
        setContribuyentes(datosReales);
        setUsandoDatosMock(false);
        console.log(`✅ [useContribuyentes] ${datosReales.length} contribuyentes reales cargados`);
      } else {
        // Usar datos mock
        setContribuyentes(CONTRIBUYENTES_MOCK);
        setUsandoDatosMock(true);
        console.log(`ℹ️ [useContribuyentes] Usando ${CONTRIBUYENTES_MOCK.length} contribuyentes de ejemplo`);
      }
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error:', error);
      setError('Error al cargar contribuyentes');
      
      // En caso de error, usar datos mock
      setContribuyentes(CONTRIBUYENTES_MOCK);
      setUsandoDatosMock(true);
    } finally {
      setLoading(false);
    }
  }, [loading, yaIntentoCarga, tieneAutenticacion]);
  
  /**
   * Busca contribuyentes con filtros
   */
  const buscarContribuyentes = useCallback(async (filtro?: FiltroContribuyente) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Buscando con filtros:', filtro);
      
      // Si estamos usando datos mock o no hay filtros significativos
      if (usandoDatosMock || !filtro || (!filtro.busqueda && !filtro.tipoContribuyente)) {
        // Filtrar datos locales
        let resultados = usandoDatosMock ? [...CONTRIBUYENTES_MOCK] : [...contribuyentes];
        
        if (filtro) {
          if (filtro.tipoContribuyente) {
            resultados = resultados.filter(item => 
              item.tipoPersona === filtro.tipoContribuyente
            );
          }
          
          if (filtro.busqueda) {
            const busquedaLower = filtro.busqueda.toLowerCase();
            resultados = resultados.filter(item =>
              item.contribuyente.toLowerCase().includes(busquedaLower) ||
              item.documento.toLowerCase().includes(busquedaLower) ||
              item.direccion.toLowerCase().includes(busquedaLower)
            );
          }
        }
        
        setContribuyentes(resultados);
        console.log(`✅ [useContribuyentes] ${resultados.length} resultados encontrados`);
        
        if (resultados.length === 0) {
          NotificationService.info('No se encontraron contribuyentes con los criterios especificados');
        }
      } else {
        // Intentar búsqueda en el servidor si hay autenticación
        if (tieneAutenticacion()) {
          try {
            const resultados = await contribuyenteService.buscar(filtro.busqueda || '');
            setContribuyentes(resultados.map(convertirAListItem));
            setUsandoDatosMock(false);
          } catch (error) {
            console.warn('⚠️ [useContribuyentes] Error en búsqueda remota, usando búsqueda local');
            await buscarContribuyentes(filtro); // Recursión con datos locales
          }
        } else {
          // Sin auth, buscar en datos actuales
          await cargarContribuyentes();
        }
      }
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al buscar:', error);
      setError('Error al buscar contribuyentes');
    } finally {
      setLoading(false);
    }
  }, [contribuyentes, usandoDatosMock, tieneAutenticacion, cargarContribuyentes]);
  
  /**
   * Guardar un contribuyente
   */
  const guardarContribuyente = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useContribuyentes] Guardando contribuyente:', data);
      
      if (tieneAutenticacion() && !usandoDatosMock) {
        // Intentar guardar en el servidor
        try {
          const resultado = await contribuyenteService.crear(data);
          NotificationService.success('Contribuyente guardado exitosamente');
          
          // Recargar lista
          await cargarContribuyentes();
          return true;
          
        } catch (error: any) {
          console.error('❌ [useContribuyentes] Error al guardar en servidor:', error);
          
          if (error.message?.includes('401') || error.message?.includes('403')) {
            NotificationService.error('Sin autorización. Por favor, inicie sesión.');
          } else {
            NotificationService.error('Error al guardar contribuyente');
          }
          return false;
        }
      } else {
        // Modo mock: simular guardado
        console.log('ℹ️ [useContribuyentes] Guardado simulado (modo demo)');
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        NotificationService.info('Guardado simulado (modo demostración)');
        
        // Agregar a la lista temporal si es nuevo
        if (!data.codContribuyente) {
          const nuevoMock: ContribuyenteListItem = {
            codigo: Math.max(...contribuyentes.map(c => c.codigo), 0) + 1,
            contribuyente: data.esPersonaJuridica 
              ? data.razonSocial 
              : `${data.apellidoPaterno} ${data.apellidoMaterno} ${data.nombres}`.trim(),
            documento: data.numeroDocumento,
            direccion: data.direccion || 'Sin dirección',
            telefono: data.telefono || '',
            tipoPersona: data.esPersonaJuridica ? 'juridica' : 'natural'
          };
          
          setContribuyentes([...contribuyentes, nuevoMock]);
        }
        
        return true;
      }
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al guardar:', error);
      setError(error.message || 'Error al guardar contribuyente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tieneAutenticacion, usandoDatosMock, contribuyentes, cargarContribuyentes]);
  
  /**
   * Obtener un contribuyente por código
   */
  const obtenerContribuyente = useCallback(async (codigo: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Obteniendo contribuyente:', codigo);
      
      // Si hay auth y no estamos en modo mock, intentar obtener del servidor
      if (tieneAutenticacion() && !usandoDatosMock) {
        try {
          const contribuyente = await contribuyenteService.obtenerPorCodigo(codigo);
          if (contribuyente) {
            return contribuyente;
          }
        } catch (error) {
          console.warn('⚠️ [useContribuyentes] Error al obtener del servidor, buscando localmente');
        }
      }
      
      // Buscar en datos locales
      const encontrado = contribuyentes.find(c => c.codigo === codigo);
      
      if (encontrado) {
        // Convertir al formato esperado
        const nombres = encontrado.contribuyente.split(' ');
        return {
          codigoContribuyente: encontrado.codigo,
          codigoPersona: encontrado.codigo,
          nombre: encontrado.contribuyente,
          numeroDocumento: encontrado.documento,
          direccion: encontrado.direccion,
          telefono: encontrado.telefono,
          tipoPersona: encontrado.tipoPersona,
          apellidoPaterno: encontrado.tipoPersona === 'natural' ? (nombres[0] || '') : '',
          apellidoMaterno: encontrado.tipoPersona === 'natural' ? (nombres[1] || '') : '',
          nombres: encontrado.tipoPersona === 'natural' ? nombres.slice(2).join(' ') : '',
          razonSocial: encontrado.tipoPersona === 'juridica' ? encontrado.contribuyente : ''
        };
      }
      
      NotificationService.warning('Contribuyente no encontrado');
      return null;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al obtener contribuyente:', error);
      setError(error.message || 'Error al obtener contribuyente');
      return null;
    } finally {
      setLoading(false);
    }
  }, [tieneAutenticacion, usandoDatosMock, contribuyentes]);
  
  return {
    // Estado
    contribuyentes,
    loading,
    error,
    usandoDatosMock,
    
    // Acciones
    cargarContribuyentes,
    buscarContribuyentes,
    guardarContribuyente,
    obtenerContribuyente,
    
    // Utilidades
    totalContribuyentes: contribuyentes.length,
    tieneAutenticacion: tieneAutenticacion()
  };
};