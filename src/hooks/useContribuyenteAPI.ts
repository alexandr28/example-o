// src/hooks/useContribuyenteAPI.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { personaService, PersonaData } from '../services/personaService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Mapea el tipo de documento del formulario al código de la API
 */
const mapearTipoDocumento = (tipo: string): string => {
  const mapeo: Record<string, string> = {
    'DNI': '1',
    'RUC': '2',
    'Carnet de Extranjería': '4',
    'Pasaporte': '5',
    'Partida de Nacimiento': '6',
    'Otros': '7'
  };
  return mapeo[tipo] || '1';
};

/**
 * Mapea el estado civil al código de la API
 */
const mapearEstadoCivil = (estado: string): number => {
  const mapeo: Record<string, number> = {
    'Soltero/a': 1,
    'Casado/a': 2,
    'Divorciado/a': 3,
    'Viudo/a': 4,
    'Conviviente': 5
  };
  return mapeo[estado] || 1;
};

/**
 * Mapea el sexo al código de la API
 */
const mapearSexo = (sexo: string): number => {
  return sexo === 'Masculino' ? 1 : 2;
};

/**
 * Formatea la fecha al formato esperado por la API
 */
const formatearFecha = (fecha: any): string => {
  if (!fecha) return '';
  
  // Si es un objeto Date
  if (fecha instanceof Date) {
    return fecha.toISOString().split('T')[0];
  }
  
  // Si es una cadena, intentar parsearla
  if (typeof fecha === 'string') {
    const date = new Date(fecha);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return '';
};

/**
 * Hook para integrar el ContribuyenteForm con las APIs reales
 */
export const useContribuyenteAPI = () => {
  const navigate = useNavigate();
  
  /**
   * Guarda un contribuyente usando la API de persona
   */
  const guardarContribuyente = useCallback(async (formData: any) => {
    try {
      console.log('🚀 [useContribuyenteAPI] Procesando datos del formulario:', formData);
      
      // Validar que tengamos los datos mínimos requeridos
      if (!formData.numeroDocumento) {
        throw new Error('El número de documento es requerido');
      }
      
      if (!formData.esPersonaJuridica && !formData.nombres) {
        throw new Error('El nombre es requerido para personas naturales');
      }
      
      if (formData.esPersonaJuridica && !formData.razonSocial) {
        throw new Error('La razón social es requerida para personas jurídicas');
      }
      
      // 1. Preparar datos de la persona principal
      const personaPrincipalData: PersonaData = {
        codPersona: null,
        codTipopersona: formData.esPersonaJuridica ? "0302" : "0301",
        codTipoDocumento: mapearTipoDocumento(formData.tipoDocumento),
        numerodocumento: formData.numeroDocumento.toString(),
        nombres: formData.esPersonaJuridica 
          ? (formData.razonSocial || '').toUpperCase()
          : (formData.nombres || '').toUpperCase(),
        apellidopaterno: !formData.esPersonaJuridica ? (formData.apellidoPaterno || '').toUpperCase() : '',
        apellidomaterno: !formData.esPersonaJuridica ? (formData.apellidoMaterno || '').toUpperCase() : '',
        fechanacimiento: !formData.esPersonaJuridica ? formatearFecha(formData.fechaNacimiento) : '',
        codestadocivil: !formData.esPersonaJuridica ? mapearEstadoCivil(formData.estadoCivil) : 1,
        codsexo: !formData.esPersonaJuridica ? mapearSexo(formData.sexo) : 1,
        telefono: formData.telefono || '',
        codDireccion: formData.direccion?.id || 1,
        lote: formData.nFinca || null,
        otros: formData.otroNumero || null,
        parametroBusqueda: null,
        codUsuario: 1
      };
      
      // 2. Crear la persona principal
      console.log('📤 [useContribuyenteAPI] Enviando a API:', personaPrincipalData);
      const personaCreada = await personaService.crear(personaPrincipalData);
      
      if (!personaCreada.codPersona) {
        throw new Error('No se pudo crear la persona principal');
      }
      
      console.log('✅ [useContribuyenteAPI] Persona creada con código:', personaCreada.codPersona);
      
      // 3. Si tiene cónyuge/representante, crearlo también
      if (formData.tieneConyugeRepresentante && formData.conyugeRepresentante?.numeroDocumento) {
        const personaRelacionadaData: PersonaData = {
          codPersona: null,
          codTipopersona: "0301", // Siempre persona natural para cónyuge/representante
          codTipoDocumento: mapearTipoDocumento(formData.conyugeRepresentante.tipoDocumento),
          numerodocumento: formData.conyugeRepresentante.numeroDocumento.toString(),
          nombres: (formData.conyugeRepresentante.nombres || '').toUpperCase(),
          apellidopaterno: (formData.conyugeRepresentante.apellidoPaterno || '').toUpperCase(),
          apellidomaterno: (formData.conyugeRepresentante.apellidoMaterno || '').toUpperCase(),
          fechanacimiento: formatearFecha(formData.conyugeRepresentante.fechaNacimiento),
          codestadocivil: mapearEstadoCivil(formData.conyugeRepresentante.estadoCivil),
          codsexo: mapearSexo(formData.conyugeRepresentante.sexo),
          telefono: formData.conyugeRepresentante.telefono || '',
          codDireccion: formData.conyugeRepresentante.direccion?.id || 1,
          lote: formData.conyugeRepresentante.nFinca || null,
          otros: formData.conyugeRepresentante.otroNumero || null,
          parametroBusqueda: null,
          codUsuario: 1
        };
        
        console.log('📤 [useContribuyenteAPI] Creando cónyuge/representante...');
        const personaRelacionada = await personaService.crear(personaRelacionadaData);
        
        console.log('✅ [useContribuyenteAPI] Cónyuge/representante creado:', personaRelacionada.codPersona);
      }
      
      // 4. Mostrar notificación de éxito
      NotificationService.success('Contribuyente registrado correctamente');
      
      // 5. Navegar a la lista de contribuyentes después de 2 segundos
      setTimeout(() => {
        navigate('/contribuyente/consulta');
      }, 2000);
      
      return personaCreada;
      
    } catch (error: any) {
      console.error('❌ [useContribuyenteAPI] Error al guardar:', error);
      NotificationService.error(error.message || 'Error al registrar contribuyente');
      throw error;
    }
  }, [navigate]);
  
  return {
    guardarContribuyente
  };
};