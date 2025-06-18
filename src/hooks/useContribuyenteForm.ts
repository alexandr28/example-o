// src/hooks/useContribuyenteForm.ts
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
import { contribuyenteService, ContribuyenteFormData as ApiContribuyenteData } from '../services/contribuyenteService';
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
  
  // Determinar tipo de contribuyente
  const tipoContribuyente = useMemo(() => {
    if (tipoContribuyenteValue === TipoContribuyente.PERSONA_NATURAL) return TipoContribuyente.PERSONA_NATURAL;
    if (tipoContribuyenteValue === TipoContribuyente.PERSONA_JURIDICA) return TipoContribuyente.PERSONA_JURIDICA;
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

  // Mapear datos del formulario a la estructura de la API
  const mapFormDataToApi = useCallback((
    contribuyenteData: ContribuyenteFormData,
    conyugeData?: ConyugeRepresentanteFormData
  ): ApiContribuyenteData => {
    // Mapear tipo de persona según el tipo de contribuyente
    const codTipopersona = tipoContribuyente === TipoContribuyente.PERSONA_JURIDICA ? '0302' : '0301';
    
    // Mapear tipo de documento
    const tipoDocMap: { [key: string]: string } = {
      [TipoDocumento.DNI]: '4101',
      [TipoDocumento.RUC]: '4102',
      [TipoDocumento.PASAPORTE]: '4103',
      [TipoDocumento.CARNET_EXTRANJERIA]: '4104'
    };
    
    // Mapear sexo
    const sexoMap: { [key: string]: string } = {
      [Sexo.MASCULINO]: '0701',
      [Sexo.FEMENINO]: '0702'
    };
    
    // Mapear estado civil
    const estadoCivilMap: { [key: string]: string } = {
      [EstadoCivil.SOLTERO]: '0801',
      [EstadoCivil.CASADO]: '0802',
      [EstadoCivil.DIVORCIADO]: '0803',
      [EstadoCivil.VIUDO]: '0804',
      [EstadoCivil.CONVIVIENTE]: '0805'
    };
    
    // Para persona jurídica, separar razón social en partes
    let nombres = '';
    let apellidopaterno = '';
    let apellidomaterno = '';
    
    if (tipoContribuyente === TipoContribuyente.PERSONA_JURIDICA) {
      nombres = contribuyenteData.nombreRazonSocial;
    } else {
      // Para persona natural, parsear apellidos y nombres
      const partes = contribuyenteData.nombreRazonSocial.split(' ');
      if (partes.length >= 3) {
        apellidopaterno = partes[0];
        apellidomaterno = partes[1];
        nombres = partes.slice(2).join(' ');
      } else if (partes.length === 2) {
        apellidopaterno = partes[0];
        nombres = partes[1];
      } else {
        nombres = contribuyenteData.nombreRazonSocial;
      }
    }
    
    // Construir objeto para la API
    const apiData: ApiContribuyenteData = {
      codTipopersona,
      codTipoDocumento: tipoDocMap[contribuyenteData.tipoDocumento] || contribuyenteData.tipoDocumento,
      numerodocumento: contribuyenteData.numeroDocumento,
      nombres,
      apellidopaterno,
      apellidomaterno,
      direccion: contribuyenteData.direccion?.descripcion || '',
      telefono: contribuyenteData.telefono || '',
      codestadocivil: estadoCivilMap[contribuyenteData.estadoCivil] || '',
      codsexo: sexoMap[contribuyenteData.sexo] || '',
      fechanacimiento: contribuyenteData.fechaNacimiento,
      codDireccion: contribuyenteData.direccion?.id
    };
    
    // Agregar datos del cónyuge si existen
    if (conyugeData && contribuyenteData.mostrarFormConyuge && tipoContribuyente === TipoContribuyente.PERSONA_NATURAL) {
      const conyugePartes = conyugeData.apellidosNombres.split(' ');
      
      apiData.conyuge = {
        tipoDocumento: tipoDocMap[conyugeData.tipoDocumento] || conyugeData.tipoDocumento,
        numeroDocumento: conyugeData.numeroDocumento,
        nombres: conyugePartes.length > 2 ? conyugePartes.slice(2).join(' ') : conyugePartes[conyugePartes.length - 1] || '',
        apellidopaterno: conyugePartes[0] || '',
        apellidomaterno: conyugePartes[1] || '',
        telefono: conyugeData.telefono,
        direccion: conyugeData.direccion?.descripcion,
        codDireccion: conyugeData.direccion?.id
      };
    }
    
    // Agregar datos del representante si es persona jurídica
    if (conyugeData && contribuyenteData.mostrarFormConyuge && tipoContribuyente === TipoContribuyente.PERSONA_JURIDICA) {
      const reprePartes = conyugeData.apellidosNombres.split(' ');
      
      apiData.representante = {
        tipoDocumento: tipoDocMap[conyugeData.tipoDocumento] || conyugeData.tipoDocumento,
        numeroDocumento: conyugeData.numeroDocumento,
        nombres: reprePartes.length > 2 ? reprePartes.slice(2).join(' ') : reprePartes[reprePartes.length - 1] || '',
        apellidopaterno: reprePartes[0] || '',
        apellidomaterno: reprePartes[1] || '',
        telefono: conyugeData.telefono,
        direccion: conyugeData.direccion?.descripcion,
        codDireccion: conyugeData.direccion?.id
      };
    }
    
    return apiData;
  }, [tipoContribuyente]);

  // Manejar el envío del formulario
  const onSubmit = contribuyenteForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      let apiData: ApiContribuyenteData;
      
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