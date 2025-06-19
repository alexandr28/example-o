// src/hooks/useContribuyenteForm.ts - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
  ContribuyenteFormData, 
  ConyugeRepresentanteFormData, 
  TipoContribuyente,
  TipoDocumento,
  Sexo,
  EstadoCivil,
  Direccion
} from '../types';
import { contribuyenteSchema, conyugeRepresentanteSchema } from '../schemas/contribuyenteSchemas';
import { contribuyenteService, ContribuyenteFormData as ApiContribuyenteFormData } from '../services/contribuyenteService';
import { direccionService } from '../services/direcionService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Hook personalizado para la gestión del formulario de contribuyentes
 */
export const useContribuyenteForm = () => {
  const navigate = useNavigate();
  
  // Estados
  const [isDireccionModalOpen, setIsDireccionModalOpen] = useState(false);
  const [isConyugeDireccionModalOpen, setIsConyugeDireccionModalOpen] = useState(false);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulario principal del contribuyente
  const contribuyenteForm = useForm<ContribuyenteFormData>({
    resolver: zodResolver(contribuyenteSchema) as any,
    defaultValues: {
      tipoContribuyente: '',
      tipoDocumento: '',
      numeroDocumento: '',
      nombreRazonSocial: '',
      telefono: '',
      sexo: '',
      estadoCivil: '',
      fechaNacimiento: null,
      direccion: null,
      nFinca: '',
      otroNumero: '',
      mostrarFormConyuge: false,
    },
  });

  // Formulario del cónyuge o representante legal
  const conyugeRepresentanteForm = useForm<ConyugeRepresentanteFormData>({
    resolver: zodResolver(conyugeRepresentanteSchema) as any,
    defaultValues: {
      tipoDocumento: '',
      numeroDocumento: '',
      apellidosNombres: '',
      telefono: '',
      sexo: '',
      estadoCivil: '',
      fechaNacimiento: null,
      direccion: null,
      nFinca: '',
    },
  });

  // Valores observados
  const { watch: watchContribuyente, setValue: setContribuyenteValue } = contribuyenteForm;
  const { setValue: setConyugeValue } = conyugeRepresentanteForm;
  
  const tipoContribuyenteValue = watchContribuyente('tipoContribuyente');
  const mostrarFormConyuge = watchContribuyente('mostrarFormConyuge');
  
  // Determinar tipo de contribuyente - CORREGIDO
  const tipoContribuyente = useMemo(() => {
    // Manejar tanto valores en minúsculas como mayúsculas
    if (tipoContribuyenteValue === 'persona_natural' || 
        tipoContribuyenteValue === 'PERSONA_NATURAL' ||
        tipoContribuyenteValue === TipoContribuyente.PERSONA_NATURAL) {
      return TipoContribuyente.PERSONA_NATURAL;
    }
    
    if (tipoContribuyenteValue === 'persona_juridica' || 
        tipoContribuyenteValue === 'PERSONA_JURIDICA' ||
        tipoContribuyenteValue === TipoContribuyente.PERSONA_JURIDICA) {
      return TipoContribuyente.PERSONA_JURIDICA;
    }
    
    return null;
  }, [tipoContribuyenteValue]);

  // Cargar direcciones al montar el componente
  useEffect(() => {
    const cargarDirecciones = async () => {
      try {
        const data = await direccionService.getAll();
        setDirecciones(data);
      } catch (error) {
        console.error('Error al cargar direcciones:', error);
        // Usar direcciones mock si hay error
        setDirecciones([
          { id: 1, descripcion: 'Sector Norte Barrio Nuevo Calle Principal', lado: '-', loteInicial: 0, loteFinal: 0 },
          { id: 2, descripcion: 'Sector Sur Barrio Las Flores Av. Los Jardines', lado: 'I', loteInicial: 1, loteFinal: 60 },
          { id: 3, descripcion: 'Sector Centro Barrio Comercial Jr. Los Empresarios', lado: 'P', loteInicial: 1, loteFinal: 100 },
        ]);
      }
    };
    
    cargarDirecciones();
  }, []);

  // Manejo de modales
  const handleOpenDireccionModal = useCallback(() => setIsDireccionModalOpen(true), []);
  const handleCloseDireccionModal = useCallback(() => setIsDireccionModalOpen(false), []);
  const handleOpenConyugeDireccionModal = useCallback(() => setIsConyugeDireccionModalOpen(true), []);
  const handleCloseConyugeDireccionModal = useCallback(() => setIsConyugeDireccionModalOpen(false), []);

  // Selección de direcciones
  const handleSelectDireccion = useCallback((direccion: Direccion) => {
    setContribuyenteValue('direccion', direccion);
    handleCloseDireccionModal();
  }, [setContribuyenteValue, handleCloseDireccionModal]);

  const handleSelectConyugeDireccion = useCallback((direccion: Direccion) => {
    setConyugeValue('direccion', direccion);
    handleCloseConyugeDireccionModal();
  }, [setConyugeValue, handleCloseConyugeDireccionModal]);

  // Toggle formulario cónyuge/representante
  const toggleConyugeForm = useCallback(() => {
    setContribuyenteValue('mostrarFormConyuge', !mostrarFormConyuge);
  }, [mostrarFormConyuge, setContribuyenteValue]);

  // Mapear datos del formulario a la estructura de la API - CORREGIDO
  const mapFormDataToApi = useCallback((
    contribuyenteData: ContribuyenteFormData,
    conyugeData?: ConyugeRepresentanteFormData
  ): ApiContribuyenteFormData => {
    // IMPORTANTE: Verificar si el tipoContribuyente está seleccionado
    if (!contribuyenteData.tipoContribuyente) {
      throw new Error('Debe seleccionar el tipo de contribuyente');
    }
    
    // Mapear tipo de persona según el tipo de contribuyente
    let codTipopersona = '0301'; // Por defecto persona natural
    
    // Verificar todas las posibles formas del valor
    const tipoContribuyenteNormalizado = contribuyenteData.tipoContribuyente.toLowerCase();
    
    if (tipoContribuyenteNormalizado === 'persona_juridica' || 
        tipoContribuyenteNormalizado === 'juridica' ||
        tipoContribuyenteNormalizado === TipoContribuyente.PERSONA_JURIDICA) {
      codTipopersona = '0302';
    } else if (tipoContribuyenteNormalizado === 'persona_natural' || 
               tipoContribuyenteNormalizado === 'natural' ||
               tipoContribuyenteNormalizado === TipoContribuyente.PERSONA_NATURAL) {
      codTipopersona = '0301';
    }
    
    console.log('🔍 Tipo contribuyente recibido:', contribuyenteData.tipoContribuyente);
    console.log('🔍 Código tipo persona asignado:', codTipopersona);
    
    // Mapear tipo de documento - CORREGIDO para manejar minúsculas
    const tipoDocMap: Record<string, string> = {
      'dni': '4101',
      'DNI': '4101',
      [TipoDocumento.DNI]: '4101',
      'ruc': '4102',
      'RUC': '4102',
      [TipoDocumento.RUC]: '4102',
      'pasaporte': '4103',
      'PASAPORTE': '4103',
      [TipoDocumento.PASAPORTE]: '4103',
      'carnet_extranjeria': '4104',
      'CARNET_EXTRANJERIA': '4104',
      [TipoDocumento.CARNET_EXTRANJERIA]: '4104'
    };
    
    // Mapear sexo - CORREGIDO
    const sexoMap: Record<string, string> = {
      'masculino': '0701',
      'MASCULINO': '0701',
      [Sexo.MASCULINO]: '0701',
      'femenino': '0702',
      'FEMENINO': '0702',
      [Sexo.FEMENINO]: '0702'
    };
    
    // Mapear estado civil - CORREGIDO
    const estadoCivilMap: Record<string, string> = {
      'soltero': '0801',
      'SOLTERO': '0801',
      [EstadoCivil.SOLTERO]: '0801',
      'casado': '0802',
      'CASADO': '0802',
      [EstadoCivil.CASADO]: '0802',
      'divorciado': '0803',
      'DIVORCIADO': '0803',
      [EstadoCivil.DIVORCIADO]: '0803',
      'viudo': '0804',
      'VIUDO': '0804',
      [EstadoCivil.VIUDO]: '0804',
      'conviviente': '0805',
      'CONVIVIENTE': '0805'
    };
    
    // Para persona jurídica, todo el nombre va en "nombres"
    let nombres = '';
    let apellidopaterno = '';
    let apellidomaterno = '';
    
    const esPersonaJuridica = codTipopersona === '0302';
    
    if (esPersonaJuridica) {
      // Para jurídica, todo va en nombres
      nombres = contribuyenteData.nombreRazonSocial || 'SIN RAZON SOCIAL';
      apellidopaterno = '';
      apellidomaterno = '';
    } else {
      // Para persona natural, parsear apellidos y nombres
      const partes = (contribuyenteData.nombreRazonSocial || '').trim().split(/\s+/).filter(Boolean);
      
      if (partes.length >= 3) {
        apellidopaterno = partes[0] || 'SIN APELLIDO';
        apellidomaterno = partes[1] || 'SIN APELLIDO';
        nombres = partes.slice(2).join(' ') || 'SIN NOMBRE';
      } else if (partes.length === 2) {
        apellidopaterno = partes[0] || 'SIN APELLIDO';
        apellidomaterno = 'SIN APELLIDO';
        nombres = partes[1] || 'SIN NOMBRE';
      } else if (partes.length === 1) {
        apellidopaterno = 'SIN APELLIDO';
        apellidomaterno = 'SIN APELLIDO';
        nombres = partes[0] || 'SIN NOMBRE';
      } else {
        // Si no hay nada, usar valores por defecto
        apellidopaterno = 'SIN APELLIDO';
        apellidomaterno = 'SIN APELLIDO';
        nombres = 'SIN NOMBRE';
      }
    }
    
    // Construir objeto para la API - USANDO LA INTERFAZ CORRECTA DEL SERVICIO
    const apiData: ApiContribuyenteFormData = {
      // Campo crítico - NUNCA debe ser null
      codTipopersona: codTipopersona,
      
      // Otros campos obligatorios con nombres exactos que espera el servicio
      codTipoDocumento: tipoDocMap[contribuyenteData.tipoDocumento] || '4101',
      numerodocumento: contribuyenteData.numeroDocumento || '', // Nota: es "numerodocumento" no "numeroDocumento"
      nombres: nombres,
      apellidopaterno: apellidopaterno,
      apellidomaterno: apellidomaterno,
      direccion: contribuyenteData.direccion?.descripcion || 'SIN DIRECCION',
      telefono: contribuyenteData.telefono || '',
      lote: contribuyenteData.nFinca || '',
      otros: contribuyenteData.otroNumero || ''
    };
    
    // Campos opcionales solo para persona natural
    if (!esPersonaJuridica) {
      apiData.codestadocivil = estadoCivilMap[contribuyenteData.estadoCivil] || '0801';
      apiData.codsexo = sexoMap[contribuyenteData.sexo] || '0701';
      
      if (contribuyenteData.fechaNacimiento) {
        apiData.fechanacimiento = contribuyenteData.fechaNacimiento;
      }
    }
    
    // Solo agregar codDireccion si tiene un valor válido
    if (contribuyenteData.direccion?.id && contribuyenteData.direccion.id > 0) {
      apiData.codDireccion = contribuyenteData.direccion.id;
    }
    
    // Log para debug
    console.log('📋 Datos finales para API:', {
      codTipopersona: apiData.codTipopersona,
      codTipoDocumento: apiData.codTipoDocumento,
      numerodocumento: apiData.numerodocumento,
      nombres: apiData.nombres,
      apellidopaterno: apiData.apellidopaterno,
      apellidomaterno: apiData.apellidomaterno
    });
    
    // Agregar datos del cónyuge si existen (solo para persona natural)
    if (conyugeData && contribuyenteData.mostrarFormConyuge && !esPersonaJuridica) {
      const conyugePartes = (conyugeData.apellidosNombres || '').trim().split(/\s+/).filter(Boolean);
      
      // Crear objeto conyuge con la estructura correcta
      apiData.conyuge = {
        tipoDocumento: tipoDocMap[conyugeData.tipoDocumento] || '4101',
        numeroDocumento: conyugeData.numeroDocumento || '',
        nombres: conyugePartes.length > 2 ? conyugePartes.slice(2).join(' ') : (conyugePartes[conyugePartes.length - 1] || ''),
        apellidopaterno: conyugePartes[0] || '',
        apellidomaterno: conyugePartes[1] || '',
        telefono: conyugeData.telefono || '',
        direccion: conyugeData.direccion?.descripcion || '',
        codDireccion: conyugeData.direccion?.id
      };
    }
    
    // Agregar datos del representante si es persona jurídica
    if (conyugeData && contribuyenteData.mostrarFormConyuge && esPersonaJuridica) {
      const reprePartes = (conyugeData.apellidosNombres || '').trim().split(/\s+/).filter(Boolean);
      
      // Crear objeto representante con la estructura correcta
      apiData.representante = {
        tipoDocumento: tipoDocMap[conyugeData.tipoDocumento] || '4101',
        numeroDocumento: conyugeData.numeroDocumento || '',
        nombres: reprePartes.length > 2 ? reprePartes.slice(2).join(' ') : (reprePartes[reprePartes.length - 1] || ''),
        apellidopaterno: reprePartes[0] || '',
        apellidomaterno: reprePartes[1] || '',
        telefono: conyugeData.telefono || '',
        direccion: conyugeData.direccion?.descripcion || '',
        codDireccion: conyugeData.direccion?.id
      };
    }
    
    // Validación final - NUNCA enviar si codTipopersona es null
    if (!apiData.codTipopersona) {
      throw new Error('Error: No se pudo determinar el tipo de persona');
    }
    
    return apiData;
  }, []);

  // Manejar el envío del formulario
  const onSubmit = contribuyenteForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      let apiData;
      
      // Si hay formulario de cónyuge/representante, validarlo primero
      if (data.mostrarFormConyuge) {
        const isValid = await conyugeRepresentanteForm.trigger();
        if (!isValid) {
          NotificationService.error('Por favor complete los datos del ' + 
            (tipoContribuyente === TipoContribuyente.PERSONA_NATURAL ? 'cónyuge' : 'representante legal'));
          setLoading(false);
          return;
        }
        
        const conyugeData = conyugeRepresentanteForm.getValues();
        apiData = mapFormDataToApi(data, conyugeData);
      } else {
        apiData = mapFormDataToApi(data);
      }
      
      console.log('📤 Enviando datos a la API:', apiData);
      
      // Crear el contribuyente
      await contribuyenteService.create(apiData);
      
      NotificationService.success('Contribuyente creado exitosamente');
      
      // Redirigir a la lista de contribuyentes después de 1 segundo
      setTimeout(() => {
        navigate('/contribuyente/consulta');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error al crear contribuyente:', error);
      NotificationService.error(error.message || 'Error al crear contribuyente');
    } finally {
      setLoading(false);
    }
  });

  // Obtener texto completo de dirección
  const getDireccionTextoCompleto = useCallback((direccion: Direccion | null, nFinca: string, otroNumero?: string) => {
    if (!direccion) return '';
    
    let texto = `${direccion.descripcion}`;
    
    if (nFinca) {
      texto += ` - N° FINCA: ${nFinca}`;
    }
    
    if (otroNumero) {
      texto += ` - OTRO: ${otroNumero}`;
    }
    
    return texto;
  }, []);

  // Verificar si deshabilitar campos de persona
  const shouldDisablePersonaFields = useMemo(() => 
    tipoContribuyente === TipoContribuyente.PERSONA_JURIDICA, 
    [tipoContribuyente]
  );
  
  // Texto del botón cónyuge/representante
  const getConyugeButtonText = useCallback(() => {
    if (mostrarFormConyuge) {
      return tipoContribuyente === TipoContribuyente.PERSONA_NATURAL 
        ? 'Ocultar datos del cónyuge'
        : 'Ocultar datos del representante';
    }
    
    return tipoContribuyente === TipoContribuyente.PERSONA_NATURAL 
      ? 'Agregar datos del cónyuge'
      : 'Agregar representante legal';
  }, [tipoContribuyente, mostrarFormConyuge]);

  return {
    // Formularios
    contribuyenteForm,
    conyugeRepresentanteForm,
    
    // Estados
    tipoContribuyente,
    mostrarFormConyuge,
    shouldDisablePersonaFields,
    isDireccionModalOpen,
    isConyugeDireccionModalOpen,
    direcciones,
    loading,
    
    // Handlers
    onSubmit,
    handleOpenDireccionModal,
    handleCloseDireccionModal,
    handleOpenConyugeDireccionModal,
    handleCloseConyugeDireccionModal,
    handleSelectDireccion,
    handleSelectConyugeDireccion,
    toggleConyugeForm,
    getDireccionTextoCompleto,
    getConyugeButtonText,
  };
};