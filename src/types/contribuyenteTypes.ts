// src/types/contribuyenteTypes.ts
/**
 * Datos que espera la API para crear/actualizar un contribuyente
 * Basado en la estructura del backend
 */
export interface ContribuyenteApiData {
    // Datos principales - TODOS REQUERIDOS
    codTipopersona: string;      // '0301' para natural, '0302' para jurídica
    codTipoDocumento: string;    // '4101' DNI, '4102' RUC, etc.
    numerodocumento: string;
    nombres: string;
    apellidopaterno: string;
    apellidomaterno: string;
    direccion: string;
    fechanacimiento?: number;    // timestamp en milisegundos
    codestadocivil?: string;     // '0801' soltero, '0802' casado, etc.
    codsexo?: string;            // '0701' masculino, '0702' femenino
    telefono?: string;
    codDireccion?: number;
    lote?: string;
    otros?: string;
    
    // Datos del cónyuge (todos opcionales)
    codConyuge?: number;
    conyugeTipoDocumento?: string;
    conyugeNumeroDocumento?: string;
    conyugeNombres?: string;
    conyugeApellidopaterno?: string;
    conyugeApellidomaterno?: string;
    conyugeEstadocivil?: string;
    conyugeSexo?: string;
    conyugeTelefono?: string;
    conyugeFechanacimiento?: number;
    conyugeDireccion?: string;
    conyugeCoddireccion?: number;
    conyugeLote?: string;
    conyugeOtros?: string;
    
    // Datos del representante legal (todos opcionales)
    codRepresentanteLegal?: number;
    repreTipoDocumento?: string;
    repreNumeroDocumento?: string;
    repreNombres?: string;
    repreApellidopaterno?: string;
    repreApellidomaterno?: string;
    repreEstadocivil?: string;
    repreSexo?: string;
    repreTelefono?: string;
    repreFechanacimiento?: number;
    repreDireccion?: string;
    repreCoddireccion?: number;
    repreLote?: string;
    repreOtros?: string;
  }
  
  /**
   * Función helper para mapear datos del formulario a la API
   */
  export function mapFormToApiData(
    formData: any,
    tipoContribuyente: string
  ): ContribuyenteApiData {
    // Mapeos de códigos
    const tipoDocMap: Record<string, string> = {
      'DNI': '4101',
      'RUC': '4102',
      'PASAPORTE': '4103',
      'CARNET_EXTRANJERIA': '4104'
    };
    
    const sexoMap: Record<string, string> = {
      'MASCULINO': '0701',
      'FEMENINO': '0702'
    };
    
    const estadoCivilMap: Record<string, string> = {
      'SOLTERO': '0801',
      'CASADO': '0802',
      'DIVORCIADO': '0803',
      'VIUDO': '0804',
      'CONVIVIENTE': '0805'
    };
    
    // Determinar tipo de persona
    const codTipopersona = tipoContribuyente === 'PERSONA_JURIDICA' ? '0302' : '0301';
    
    // Separar apellidos y nombres para persona natural
    let nombres = '';
    let apellidopaterno = '';
    let apellidomaterno = '';
    
    if (tipoContribuyente === 'PERSONA_JURIDICA') {
      // Para jurídica, todo va en nombres
      nombres = formData.nombreRazonSocial || '';
      apellidopaterno = '';
      apellidomaterno = '';
    } else {
      // Para natural, separar apellidos y nombres
      const partes = (formData.nombreRazonSocial || '').split(' ').filter(Boolean);
      if (partes.length >= 3) {
        apellidopaterno = partes[0] || '';
        apellidomaterno = partes[1] || '';
        nombres = partes.slice(2).join(' ') || '';
      } else if (partes.length === 2) {
        apellidopaterno = partes[0] || '';
        apellidomaterno = '';
        nombres = partes[1] || '';
      } else if (partes.length === 1) {
        apellidopaterno = '';
        apellidomaterno = '';
        nombres = partes[0] || '';
      }
    }
    
    // Construir objeto base con valores por defecto para evitar nulls
    const apiData: ContribuyenteApiData = {
      codTipopersona,
      codTipoDocumento: tipoDocMap[formData.tipoDocumento] || formData.tipoDocumento || '4101',
      numerodocumento: formData.numeroDocumento || '',
      nombres: nombres || 'SIN NOMBRE',
      apellidopaterno: apellidopaterno || (tipoContribuyente === 'PERSONA_NATURAL' ? 'SIN APELLIDO' : ''),
      apellidomaterno: apellidomaterno || (tipoContribuyente === 'PERSONA_NATURAL' ? 'SIN APELLIDO' : ''),
      direccion: formData.direccion?.descripcion || 'SIN DIRECCION',
      telefono: formData.telefono || '',
      codestadocivil: estadoCivilMap[formData.estadoCivil] || (tipoContribuyente === 'PERSONA_NATURAL' ? '0801' : ''),
      codsexo: sexoMap[formData.sexo] || (tipoContribuyente === 'PERSONA_NATURAL' ? '0701' : ''),
      codDireccion: formData.direccion?.id || undefined,
      lote: formData.nFinca || '',
      otros: formData.otroNumero || ''
    };
    
    // Convertir fecha si existe
    if (formData.fechaNacimiento) {
      if (formData.fechaNacimiento instanceof Date) {
        apiData.fechanacimiento = formData.fechaNacimiento.getTime();
      } else if (typeof formData.fechaNacimiento === 'string') {
        const fecha = new Date(formData.fechaNacimiento);
        if (!isNaN(fecha.getTime())) {
          apiData.fechanacimiento = fecha.getTime();
        }
      }
    }
    
    return apiData;
  }