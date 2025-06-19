// src/hooks/useContribuyenteAPI.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { personaService } from '../services/personaService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Hook para integrar el ContribuyenteForm con las APIs de persona y contribuyente
 * 
 * Este hook intercepta las llamadas del formulario y las redirige a las APIs correctas
 */
export const useContribuyenteAPI = () => {
  const navigate = useNavigate();
  
  /**
   * Guarda un contribuyente usando las APIs de persona y contribuyente
   */
  const guardarContribuyente = useCallback(async (formData: any) => {
    try {
      console.log('🚀 [useContribuyenteAPI] Procesando datos del formulario:', formData);
      
      // 1. Determinar el tipo de contribuyente
      const tipoContribuyente = formData.esPersonaJuridica ? 'PERSONA_JURIDICA' : 'PERSONA_NATURAL';
      
      // 2. Preparar datos de la persona principal
      const personaPrincipalData = {
        codTipopersona: tipoContribuyente === 'PERSONA_JURIDICA' ? '0302' : '0301',
        codTipoDocumento: mapearTipoDocumento(formData.tipoDocumento),
        numerodocumento: formData.numeroDocumento,
        nombres: (formData.nombres || formData.razonSocial || '').toUpperCase(),
        apellidopaterno: formData.apellidoPaterno?.toUpperCase() || '',
        apellidomaterno: formData.apellidoMaterno?.toUpperCase() || '',
        fechanacimiento: formatearFecha(formData.fechaNacimiento),
        codestadocivil: mapearEstadoCivil(formData.estadoCivil),
        codsexo: mapearSexo(formData.sexo),
        telefono: formData.telefono || '',
        codDireccion: formData.direccion?.id || 1,
        lote: formData.nFinca || null,
        otros: formData.otroNumero || null,
        parametroBusqueda: null,
        codUsuario: 1
      };
      
      // 3. Crear la persona principal
      console.log('📤 [useContribuyenteAPI] Creando persona principal...');
      const personaCreada = await personaService.crear(personaPrincipalData);
      
      if (!personaCreada.codPersona) {
        throw new Error('No se pudo crear la persona principal');
      }
      
      // 4. Crear cónyuge/representante si existe
      let codRelacionado: number | null = null;
      if (formData.tieneConyugeRepresentante && formData.conyugeRepresentante?.numeroDocumento) {
        console.log('👥 [useContribuyenteAPI] Creando cónyuge/representante...');
        
        const relacionadoData = {
          codTipopersona: '0301', // Siempre persona natural
          codTipoDocumento: mapearTipoDocumento(formData.conyugeRepresentante.tipoDocumento),
          numerodocumento: formData.conyugeRepresentante.numeroDocumento,
          nombres: formData.conyugeRepresentante.nombres?.toUpperCase() || '',
          apellidopaterno: formData.conyugeRepresentante.apellidoPaterno?.toUpperCase() || '',
          apellidomaterno: formData.conyugeRepresentante.apellidoMaterno?.toUpperCase() || '',
          fechanacimiento: formatearFecha(formData.conyugeRepresentante.fechaNacimiento),
          codestadocivil: tipoContribuyente === 'PERSONA_NATURAL' ? 2 : 1, // Casado para cónyuge, soltero para representante
          codsexo: mapearSexo(formData.conyugeRepresentante.sexo),
          telefono: formData.conyugeRepresentante.telefono || '',
          codDireccion: formData.conyugeRepresentante.direccion?.id || 1,
          lote: formData.conyugeRepresentante.nFinca || null,
          otros: formData.conyugeRepresentante.otroNumero || null,
          parametroBusqueda: null,
          codUsuario: 1
        };
        
        const relacionadoCreado = await personaService.crear(relacionadoData);
        codRelacionado = relacionadoCreado.codPersona || null;
      }
      
      // 5. Crear el contribuyente
      const contribuyenteData = {
        codPersona: personaCreada.codPersona,
        codConyuge: tipoContribuyente === 'PERSONA_NATURAL' ? codRelacionado : null,
        codRepresentanteLegal: tipoContribuyente === 'PERSONA_JURIDICA' ? codRelacionado : null,
        codestado: "2152", // Activo
        codUsuario: 1
      };
      
      console.log('📤 [useContribuyenteAPI] Creando contribuyente:', contribuyenteData);
      
      // Llamar directamente a la API de contribuyente
      const response = await fetch('http://192.168.20.160:8080/api/contribuyente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(contribuyenteData)
      });
      
      if (!response.ok) {
        throw new Error('Error al crear contribuyente');
      }
      
      const result = await response.json();
      console.log('✅ [useContribuyenteAPI] Contribuyente creado:', result);
      
      NotificationService.success('Contribuyente registrado correctamente');
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/contribuyente/consulta');
      }, 1500);
      
      return result;
      
    } catch (error: any) {
      console.error('❌ [useContribuyenteAPI] Error:', error);
      NotificationService.error(error.message || 'Error al guardar el contribuyente');
      throw error;
    }
  }, [navigate]);
  
  return {
    guardarContribuyente
  };
};

// Funciones auxiliares de mapeo
function mapearTipoDocumento(tipo?: string): number {
  const mapa: Record<string, number> = {
    'DNI': 1,
    'RUC': 4,
    'PASAPORTE': 2,
    'CARNET_EXTRANJERIA': 3
  };
  return mapa[tipo || 'DNI'] || 1;
}

function mapearSexo(sexo?: string): number {
  const mapa: Record<string, number> = {
    'Masculino': 1,
    'Femenino': 2
  };
  return mapa[sexo || 'Masculino'] || 1;
}

function mapearEstadoCivil(estadoCivil?: string): number {
  const mapa: Record<string, number> = {
    'Soltero/a': 1,
    'Casado/a': 2,
    'Divorciado/a': 3,
    'Viudo/a': 4,
    'Conviviente': 5
  };
  return mapa[estadoCivil || 'Soltero/a'] || 1;
}

function formatearFecha(fecha?: any): string | undefined {
  if (!fecha) return undefined;
  
  if (fecha instanceof Date) {
    return fecha.toISOString().split('T')[0];
  }
  
  if (typeof fecha === 'string') {
    // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    const partes = fecha.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return fecha;
  }
  
  return undefined;
}