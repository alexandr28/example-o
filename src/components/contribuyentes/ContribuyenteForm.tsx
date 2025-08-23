// src/components/contribuyentes/ContribuyenteForm.tsx
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
  Alert,
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
  Clear as ClearIcon,
  Groups as GroupsIcon,
  Badge as BadgeIcon
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
  const navigate = useNavigate();
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
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombres: '',
      razonSocial: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      sexo: 'Masculino',
      estadoCivil: 'Soltero/a',
      fechaNacimiento: null,
      ...initialData
    },
    mode: 'onBlur'
  });

  // Formulario para cónyuge/representante
  const conyugeRepresentanteForm = useForm({
    defaultValues: {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      sexo: 'Masculino',
      estadoCivil: 'Casado/a',
      fechaNacimiento: null
    }
  });

  const esPersonaJuridica = tipoContribuyente === 'juridica';

  // Manejar cambio de tipo de contribuyente
  const handleTipoContribuyenteChange = useCallback((
    event: React.MouseEvent<HTMLElement>,
    newValue: 'natural' | 'juridica' | null
  ) => {
    if (newValue !== null) {
      setTipoContribuyente(newValue);
      principalForm.setValue('esPersonaJuridica', newValue === 'juridica');
      
      // Resetear algunos campos según el tipo
      if (newValue === 'juridica') {
        principalForm.setValue('tipoDocumento', 'RUC');
        principalForm.setValue('nombres', '');
        principalForm.setValue('apellidoPaterno', '');
        principalForm.setValue('apellidoMaterno', '');
      } else {
        principalForm.setValue('tipoDocumento', 'DNI');
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
  const getDireccionTextoCompleto = useCallback((direccion: any, nFinca: string, otroNumero?: string) => {
    if (!direccion) return '';
    
    let texto = `${direccion.descripcion}`;
    
    if (nFinca) {
      texto += ` - N° Finca: ${nFinca}`;
    }
    
    if (otroNumero) {
      texto += ` - Otro: ${otroNumero}`;
    }
    
    return texto;
  }, []);

  // Manejar submit del formulario
  const handleSubmit = principalForm.handleSubmit(async (data) => {
    try {
      setInternalLoading(true);
      
      // Si hay formulario de cónyuge/representante, validarlo también
      if (showConyugeRepresentante) {
        const conyugeData = conyugeRepresentanteForm.getValues();
        data = {
          ...data,
          tieneConyugeRepresentante: true,
          conyugeRepresentante: conyugeData
        };
      }
      
      console.log('📤 Datos del formulario:', data);
      
      if (onSubmit) {
        await onSubmit(data);
      }
      
      NotificationService.success('Contribuyente guardado correctamente');
    } catch (error: any) {
      console.error('❌ Error al guardar:', error);
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