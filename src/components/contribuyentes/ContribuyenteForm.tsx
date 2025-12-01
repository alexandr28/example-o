// src/components/contribuyentes/ContribuyenteForm.tsx
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import PersonaFormMUI from './PersonaForm';
import FormSectionMUI from '../utils/FormSecction';
import SelectorDirecciones from '../modal/SelectorDirecciones'; // CORREGIDO: Importación correcta
import { NotificationService } from '../utils/Notification';

interface ContribuyenteFormMUIProps {
  onSubmit?: (data: any) => void | Promise<void>;
  onEdit?: () => void;
  onNew?: () => void;
  initialData?: any;
  loading?: boolean;
}

const ContribuyenteFormMUI: React.FC<ContribuyenteFormMUIProps> = ({
  onSubmit,
  onEdit,
  onNew,
  initialData,
  loading: externalLoading = false
}) => {
  const theme = useTheme();
  const [internalLoading, setInternalLoading] = useState(false);
  const [showConyugeRepresentante, setShowConyugeRepresentante] = useState(false);
  const [isDireccionModalOpen, setIsDireccionModalOpen] = useState(false);
  const [isConyugeDireccionModalOpen, setIsConyugeDireccionModalOpen] = useState(false);
  const [tipoContribuyente, setTipoContribuyente] = useState<'natural' | 'juridica'>('natural');

  const loading = externalLoading || internalLoading;

  // Formulario principal
  const principalForm = useForm({
    defaultValues: {
      esPersonaJuridica: false,
      tipoDocumento: '4101', // Código para DNI
      numeroDocumento: '',
      nombres: '',
      razonSocial: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      sexo: '2001', // Código para Masculino
      estadoCivil: '', // Dejar vacío para que sea seleccionado por el usuario
      fechaNacimiento: null,
      ...initialData
    },
    mode: 'onBlur'
  });

  // Formulario para cónyuge/representante
  const conyugeRepresentanteForm = useForm({
    defaultValues: {
      tipoDocumento: '4101', // Código para DNI
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      sexo: '2001', // Código para Masculino
      estadoCivil: '', // Dejar vacío para que sea seleccionado por el usuario
      fechaNacimiento: null
    }
  });

  const esPersonaJuridica = tipoContribuyente === 'juridica';

  // Manejar cambio de tipo de contribuyente
  const handleTipoContribuyenteChange = useCallback((
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'natural' | 'juridica' | null
  ) => {
    if (newValue !== null) {
      setTipoContribuyente(newValue);
      principalForm.setValue('esPersonaJuridica', newValue === 'juridica');
      
      // Resetear algunos campos según el tipo
      if (newValue === 'juridica') {
        principalForm.setValue('tipoDocumento', '4102'); // Código para RUC
        principalForm.setValue('nombres', '');
        principalForm.setValue('apellidoPaterno', '');
        principalForm.setValue('apellidoMaterno', '');
      } else {
        principalForm.setValue('tipoDocumento', '4101'); // Código para DNI
        principalForm.setValue('razonSocial', '');
      }
    }
  }, [principalForm]);

  // Toggle cónyuge/representante
  const toggleConyugeForm = useCallback(() => {
    setShowConyugeRepresentante(!showConyugeRepresentante);
  }, [showConyugeRepresentante]);

  // Manejar apertura de modal de dirección
  const handleOpenDireccionModal = useCallback(() => {
    setIsDireccionModalOpen(true);
  }, []);

  const handleCloseDireccionModal = useCallback(() => {
    setIsDireccionModalOpen(false);
  }, []);

  const handleOpenConyugeDireccionModal = useCallback(() => {
    setIsConyugeDireccionModalOpen(true);
  }, []);

  const handleCloseConyugeDireccionModal = useCallback(() => {
    setIsConyugeDireccionModalOpen(false);
  }, []);

  // Manejar selección de dirección
  const handleSelectDireccion = useCallback((direccion: any) => {
    principalForm.setValue('direccion', direccion);
    handleCloseDireccionModal();
  }, [principalForm, handleCloseDireccionModal]);

  const handleSelectConyugeDireccion = useCallback((direccion: any) => {
    conyugeRepresentanteForm.setValue('direccion', direccion);
    handleCloseConyugeDireccionModal();
  }, [conyugeRepresentanteForm, handleCloseConyugeDireccionModal]);

  // Obtener texto completo de dirección
  const getDireccionTextoCompleto = useCallback((direccion: any, nFinca?: string, otroNumero?: string) => {
    if (!direccion) return '';

    // Obtener la descripción y eliminar la parte de "Lotes: X - Y" o "Lote: X"
    let texto = direccion.descripcion || '';
    texto = texto.replace(/,?\s*Lotes?:\s*\d+\s*-?\s*\d*/gi, '').trim();
    // Eliminar coma al final si quedó
    texto = texto.replace(/,\s*$/, '').trim();

    if (nFinca) {
      texto += ` - N° Finca: ${nFinca}`;
    }

    if (otroNumero) {
      texto += ` - Otro: ${otroNumero}`;
    }

    return texto;
  }, []);


  // Función para convertir datos del formulario al formato requerido por la API
  const convertirDatosPersona = (formData: any, esJuridica: boolean) => {
    // Convertir estado civil a número
    let codEstadoCivil = 1; // Soltero por defecto
    if (formData.estadoCivil) {
      if (formData.estadoCivil === '1801' || formData.estadoCivil === 'SOLTERO') {
        codEstadoCivil = 1;
      } else if (formData.estadoCivil === '1802' || formData.estadoCivil === 'CASADO') {
        codEstadoCivil = 2;
      } else if (formData.estadoCivil === '1803' || formData.estadoCivil === 'VIUDO') {
        codEstadoCivil = 3;
      } else if (formData.estadoCivil === '1804' || formData.estadoCivil === 'DIVORCIADO') {
        codEstadoCivil = 4;
      } else if (typeof formData.estadoCivil === 'string' && !isNaN(parseInt(formData.estadoCivil))) {
        codEstadoCivil = parseInt(formData.estadoCivil);
      }
    }
    
    return {
      // Datos requeridos según tu especificación
      codPersona: null, // Se generará por SQL
      codTipopersona: esJuridica ? "0302" : "0301",
      codTipoDocumento: formData.tipoDocumento === '4101' ? 1 : formData.tipoDocumento === '4102' ? 2 : 1, // DNI=1, RUC=2
      numerodocumento: formData.numeroDocumento?.toString() || '',
      nombres: esJuridica ? formData.razonSocial : formData.nombres,
      apellidomaterno: formData.apellidoMaterno || '',
      apellidopaterno: formData.apellidoPaterno || '',
      fechanacimiento: formData.fechaNacimiento ? 
        (formData.fechaNacimiento instanceof Date ? 
          formData.fechaNacimiento.toISOString().split('T')[0] : 
          formData.fechaNacimiento.split('T')[0]) : "1980-01-01",
      codestadocivil: codEstadoCivil,
      codsexo: formData.sexo === '2001' ? 1 : formData.sexo === '2002' ? 2 : 1, // Masculino=1, Femenino=2
      telefono: formData.telefono?.toString() || '',
      codDireccion: formData.direccion?.id || formData.direccion?.codigo || 1,
      lote: formData.nFinca?.toString() || null,
      otros: formData.otroNumero?.toString() || null,
      parametroBusqueda: null,
      codUsuario: 1
    };
  };


  // Manejar submit del formulario con APIs secuenciales usando hooks
  const handleSubmit = principalForm.handleSubmit(async (data) => {
    try {
      setInternalLoading(true);
      console.log('📤 [ContribuyenteForm] Iniciando proceso de guardado con APIs:', data);

      // PASO 1: Preparar datos de persona principal
      const personaPrincipalData = convertirDatosPersona(data, esPersonaJuridica);
      console.log('📋 [ContribuyenteForm] Datos persona principal para API:', personaPrincipalData);
      
      // Crear persona principal usando el servicio directamente
      const { personaService } = await import('../../services/personaService');
      const personaPrincipal = await personaService.crearPersonaAPI(personaPrincipalData);

      if (!personaPrincipal || !personaPrincipal.codPersona) {
        throw new Error('Error al crear persona principal - no se recibió código de persona');
      }

      console.log('✅ [ContribuyenteForm] Persona principal creada con codPersona:', personaPrincipal.codPersona);

      const codPersonaPrincipal = personaPrincipal.codPersona;

      let conyugeRepresentanteId = null;

      // PASO 2: Si hay cónyuge/representante, guardarlo también
      if (showConyugeRepresentante) {
        const conyugeData = conyugeRepresentanteForm.getValues();

        // Verificar que tiene datos mínimos requeridos
        if (conyugeData.numeroDocumento && conyugeData.nombres) {
          console.log('👫 [ContribuyenteForm] Creando cónyuge/representante:', conyugeData);

          const conyugePersonaData = convertirDatosPersona(conyugeData, false);
          const conyugePersona = await personaService.crearPersonaAPI(conyugePersonaData);

          if (conyugePersona && conyugePersona.codPersona) {
            conyugeRepresentanteId = conyugePersona.codPersona;
            console.log('✅ [ContribuyenteForm] Cónyuge/Representante creado con codPersona:', conyugeRepresentanteId);
          }
        }
      }

      // PASO 3: Crear contribuyente usando el API directamente
      const { contribuyenteService } = await import('../../services/contribuyenteService');
      
      const contribuyenteAPIData = {
        codPersona: codPersonaPrincipal,
        codConyuge: conyugeRepresentanteId,
        codRepresentanteLegal: esPersonaJuridica ? conyugeRepresentanteId : null,
        codestado: "0201", // Estado activo según API specification
        codUsuario: 1
      };
      
      console.log('📋 [ContribuyenteForm] Datos contribuyente para API:', contribuyenteAPIData);
      
      const contribuyente = await contribuyenteService.crearContribuyenteAPI(contribuyenteAPIData);
      
      if (!contribuyente) {
        throw new Error('Error al crear contribuyente');
      }
      
      console.log('✅ [ContribuyenteForm] Contribuyente creado exitosamente:', contribuyente);
      
      NotificationService.success('Contribuyente registrado exitosamente');

      // Llamar callback opcional
      if (onSubmit) {
        await onSubmit({
          persona: personaPrincipal,
          contribuyente: contribuyente,
          conyugeRepresentante: conyugeRepresentanteId
        });
      }

      // Resetear formularios después del éxito
      handleNuevo();

    } catch (error: any) {
      console.error('❌ [ContribuyenteForm] Error al guardar:', error);
      NotificationService.error(error.message || 'Error al guardar contribuyente');
    } finally {
      setInternalLoading(false);
    }
  });

  // Manejar edición
  const handleEditar = useCallback(() => {
    if (onEdit) {
      onEdit();
    }
  }, [onEdit]);

  // Manejar nuevo
  const handleNuevo = useCallback(() => {
    principalForm.reset();
    conyugeRepresentanteForm.reset();
    setShowConyugeRepresentante(false);
    setTipoContribuyente('natural');
    
    if (onNew) {
      onNew();
    }
  }, [principalForm, conyugeRepresentanteForm, onNew]);

  return (
    <>
      <Paper 
        sx={{ 
          p: 3,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 100px)' // Ajustar según la altura del header/navbar
        }}
      >
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Header con tipo de contribuyente */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Registro de Contribuyente
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Tipo de Contribuyente
              </Typography>
              <ToggleButtonGroup
                value={tipoContribuyente}
                exclusive
                onChange={handleTipoContribuyenteChange}
                aria-label="tipo de contribuyente"
                sx={{ mt: 1 }}
              >
                <ToggleButton value="natural" aria-label="persona natural">
                  <PersonIcon sx={{ mr: 1 }} />
                  Persona Natural
                </ToggleButton>
                <ToggleButton value="juridica" aria-label="persona jurídica">
                  <BusinessIcon sx={{ mr: 1 }} />
                  Persona Jurídica
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Contenedor principal con ancho completo */}
          <Box sx={{ width: '100%' }}>
            {/* Datos principales */}
           
              <PersonaFormMUI
                form={principalForm}
                isJuridica={esPersonaJuridica}
                onOpenDireccionModal={handleOpenDireccionModal}
                direccion={principalForm.watch('direccion')}
                getDireccionTextoCompleto={getDireccionTextoCompleto}
                disablePersonaFields={loading}
              />
         

            {/* Botón para agregar cónyuge/representante y Botones de acción */}
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Botón para agregar cónyuge/representante - Lado izquierdo */}
              <Button
                variant={showConyugeRepresentante ? 'outlined' : 'contained'}
                onClick={toggleConyugeForm}
                disabled={loading}
                startIcon={<GroupsIcon />}
                sx={{
                  backgroundColor: showConyugeRepresentante ? 'transparent' : alpha(theme.palette.primary.main, 0.9),
                  '&:hover': {
                    backgroundColor: showConyugeRepresentante ? 
                      alpha(theme.palette.primary.main, 0.08) : theme.palette.primary.dark
                  },
                  minWidth: '200px',
                  height: '36px'
                }}
              >
                {showConyugeRepresentante 
                  ? 'Ocultar' 
                  : esPersonaJuridica 
                    ? 'Agregar datos del representante legal' 
                    : 'Agregar datos del cónyuge'}
              </Button>

              {/* Botones de acción - Lado derecho */}
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Botón para nuevo */}
                <Button
                  variant="outlined"
                  onClick={handleNuevo}
                  disabled={loading}
                  startIcon={<AddIcon />}
                  sx={{
                    minWidth: '120px',
                    height: '36px',
                    padding: '6px 16px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Nuevo
                </Button>
                {/* Botón para editar */}
                <Button
                  variant="outlined"
                  onClick={handleEditar}
                  disabled={loading}
                  startIcon={<EditIcon />}
                  sx={{
                    minWidth: '120px',
                    height: '36px',
                    padding: '6px 16px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Editar
                </Button>
                {/* Botón para guardar */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    minWidth: '120px',
                    height: '36px',
                    padding: '6px 16px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </Stack>
            </Box>

            {/* Formulario de cónyuge/representante */}
            <Collapse in={showConyugeRepresentante}>
              <FormSectionMUI 
                title={esPersonaJuridica ? 'Datos del Representante Legal' : 'Datos del Cónyuge'}
                icon={<GroupsIcon />}
                onDelete={() => {
                  conyugeRepresentanteForm.reset();
                  toggleConyugeForm();
                }}
              >
                <PersonaFormMUI
                  form={conyugeRepresentanteForm}
                  isRepresentante={true}
                  onOpenDireccionModal={handleOpenConyugeDireccionModal}
                  direccion={conyugeRepresentanteForm.watch('direccion')}
                  getDireccionTextoCompleto={getDireccionTextoCompleto}
                  disablePersonaFields={loading}
                />
              </FormSectionMUI>
            </Collapse>

          </Box>
        </form>
      </Paper>

      {/* Modales - CORREGIDO: Usando las props correctas */}
      <SelectorDirecciones
        open={isDireccionModalOpen}
        onClose={handleCloseDireccionModal}
        onSelectDireccion={handleSelectDireccion}
      />
      
      <SelectorDirecciones
        open={isConyugeDireccionModalOpen}
        onClose={handleCloseConyugeDireccionModal}
        onSelectDireccion={handleSelectConyugeDireccion}
      />
    </>
  );
};

export default ContribuyenteFormMUI;