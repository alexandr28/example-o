// src/components/predio/AsignacionPredio.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  alpha,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {SelectorContribuyente} from '../../';
import SelectorPredios from '../pisos/SelectorPredios';
import { NotificationService } from '../../utils/Notification';
import {
  useEstadoOptions,
  useModoDeclaracionOptions
} from '../../../hooks/useConstantesOptions';
import { CreateAsignacionAPIDTO } from '../../../services/asignacionService';

interface AsignacionData {
  año: number;
  contribuyente: any;
  predio: any;
  modoDeclaracion: string;
  fechaVenta: Date | null;
  fechaDeclaracion: Date | null;
  porcentajeCondomino: number;
  esPensionista: boolean;
  estado: string;
}

interface AsignacionPredioProps {
  onCrearAsignacion?: (datos: CreateAsignacionAPIDTO) => Promise<any>;
  loading?: boolean;
  error?: string | null;
}

const AsignacionPredio: React.FC<AsignacionPredioProps> = ({
  onCrearAsignacion,
  loading: externalLoading = false,
}) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  // Hooks para opciones
  const { options: estadosOptions } = useEstadoOptions();
  const { options: modoDeclaracionOptions, loading: loadingModoDeclaracion } = useModoDeclaracionOptions();
  
  const [internalLoading, setInternalLoading] = useState(false);
  
  const loading = externalLoading || internalLoading;
  
  // Estados
  const [asignacionData, setAsignacionData] = useState<AsignacionData>({
    año: currentYear,
    contribuyente: null,
    predio: null,
    modoDeclaracion: '',
    fechaVenta: null,
    fechaDeclaracion: null,
    porcentajeCondomino: 0,
    esPensionista: false,
    estado: 'Activo'
  });
  
  const [showContribuyenteModal, setShowContribuyenteModal] = useState(false);
  const [showPredioModal, setShowPredioModal] = useState(false);

  // Debug para verificar las opciones (después de que el estado esté inicializado)
  useEffect(() => {
    console.log('🔍 modoDeclaracionOptions:', modoDeclaracionOptions);
    console.log('🔍 asignacionData.modoDeclaracion:', asignacionData.modoDeclaracion);
  }, [modoDeclaracionOptions, asignacionData.modoDeclaracion]);

  // Handlers
  const handleSelectContribuyente = (contribuyente: any) => {
    setAsignacionData({ ...asignacionData, contribuyente });
    setShowContribuyenteModal(false);
  };

  const handleSelectPredio = (predio: any) => {
    console.log('🏠 [AsignacionPredio] Predio seleccionado:', predio);
    console.log('🏠 [AsignacionPredio] Propiedades del predio:', Object.keys(predio));
    console.log('🏠 [AsignacionPredio] TODOS los códigos disponibles:', {
      codigoPredio: predio.codigoPredio,
      codPredio: predio.codPredio,
      codPredioBase: predio.codPredioBase,
      codigo: predio.codigo,
      id: predio.id,
      anio: predio.anio
    });
    console.log('🏠 [AsignacionPredio] Código que se usará:',
      predio.codPredio || predio.codigoPredio || predio.codPredioBase || predio.codigo || predio.id);
    setAsignacionData({ ...asignacionData, predio });
    setShowPredioModal(false);
  };

  const handleRegistrar = async () => {
    if (!asignacionData.contribuyente || !asignacionData.predio) {
      NotificationService.error('Debe seleccionar un contribuyente y un predio');
      return;
    }

    if (!asignacionData.fechaDeclaracion || !asignacionData.fechaVenta) {
      NotificationService.error('Debe seleccionar fechas de declaración y venta');
      return;
    }

    if (!asignacionData.modoDeclaracion) {
      NotificationService.error('Debe seleccionar un modo de declaración');
      return;
    }

    try {
      setInternalLoading(true);

      // Convertir datos del formulario al formato API
      // Limpiar espacios en blanco del código de predio
      // NOTA: Usar codPredio primero (es el código real en la BD), luego codigoPredio
      const codigoPredio = String(
        asignacionData.predio.codPredio ||
        asignacionData.predio.codigoPredio ||
        asignacionData.predio.codPredioBase ||
        asignacionData.predio.codigo ||
        asignacionData.predio.id || ''
      ).trim();

      // Extraer el año del código del predio (primeros 4 dígitos)
      // Ejemplo: "20243" -> año 2024
      const anioPredio = codigoPredio.length >= 4
        ? parseInt(codigoPredio.substring(0, 4))
        : asignacionData.año;

      console.log('🔑 [AsignacionPredio] Código de predio a enviar:', codigoPredio);
      console.log('🔑 [AsignacionPredio] Año extraído del código:', anioPredio);
      console.log('🔑 [AsignacionPredio] Campos del predio:', {
        codPredio: asignacionData.predio.codPredio,
        codigoPredio: asignacionData.predio.codigoPredio,
        codPredioBase: asignacionData.predio.codPredioBase
      });

      const codigoContribuyente = parseInt(asignacionData.contribuyente.codigo ||
                                         asignacionData.contribuyente.codContribuyente ||
                                         asignacionData.contribuyente.codigoPersona || '0');

      const datosAPI: CreateAsignacionAPIDTO = {
        anio: anioPredio,
        codPredio: codigoPredio,
        codContribuyente: codigoContribuyente,
        codAsignacion: null,
        porcentajeCondomino: asignacionData.porcentajeCondomino,
        fechaDeclaracion: asignacionData.fechaDeclaracion.toISOString().split('T')[0],
        fechaVenta: asignacionData.fechaVenta.toISOString().split('T')[0],
        codModoDeclaracion: String(asignacionData.modoDeclaracion).trim(),
        pensionista: asignacionData.esPensionista ? 1 : 0,
        codEstado: "0201" // Estado activo por defecto
      };

      console.log('📋 [AsignacionPredio] Datos para API:', datosAPI);

      if (onCrearAsignacion) {
        const resultado = await onCrearAsignacion(datosAPI);
        if (resultado) {
          // Limpiar formulario después del éxito
          handleNuevo();
        }
      } else {
        NotificationService.success('Asignación registrada exitosamente (simulado)');
      }

    } catch (error: any) {
      console.error('❌ [AsignacionPredio] Error al registrar:', error);
      NotificationService.error(error.message || 'Error al registrar asignación');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleNuevo = () => {
    setAsignacionData({
      año: currentYear,
      contribuyente: null,
      predio: null,
      modoDeclaracion: '',
      fechaVenta: null,
      fechaDeclaracion: null,
      porcentajeCondomino: 0,
      esPensionista: false,
      estado: 'Activo'
    });
    NotificationService.info('Formulario limpiado');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        {/* Sección: Seleccionar contribuyente y predio */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Seleccionar contribuyente y predio
              </Typography>
            </Stack>
            
            <Stack spacing={2}>
              {/* Primera fila - Contribuyente */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Seleccionar  Contribuyente */}
                <Box sx={{ flex: '0 0 150px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowContribuyenteModal(true)}
                    startIcon={<PersonIcon />}
                    sx={{ height: 33 }}
                  >
                    Selecionar Contribuyente
                  </Button>
                </Box>
                {/* Codigo Contribuyente */}
                <Box sx={{ flex: '0 0 140px' }}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={asignacionData.contribuyente?.codigo || ''}
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>
                {/* Nombre Contribuyente */}
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    fullWidth
                    label="Nombre del contribuyente"
                    value={asignacionData.contribuyente?.contribuyente || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>

              {/* Segunda fila - Predio */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Seleccionar Predio */}
                <Box sx={{ flex: '0 0 150px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowPredioModal(true)}
                    disabled={!asignacionData.contribuyente}
                    startIcon={<HomeIcon />}
                    sx={{ height: 33 }}
                  >
                    Seleccionar Predio
                  </Button>
                </Box>
                {/* Codigo Predio */}
                <Box sx={{ flex: '0 0 140px' }}>
                  <TextField
                    fullWidth
                    label="Código de predio"
                    value={asignacionData.predio?.codigoPredio || asignacionData.predio?.codPredio || asignacionData.predio?.codigo || asignacionData.predio?.id || ''}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>
                {/* Direccion Predio */}
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Dirección predial"
                    value={asignacionData.predio?.direccion || ''}
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Sección: Datos de la asignación */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Datos de la asignación
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              {/* Primera fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

                {/* Modo Declaracion - Usando datos del API */}
                <Box sx={{ flex: '0 0 280px' }}>
                  <Autocomplete
                    options={modoDeclaracionOptions}
                    getOptionLabel={(option) => option?.label || ''}
                    value={modoDeclaracionOptions.find(opt => String(opt.value) === String(asignacionData.modoDeclaracion)) || null}
                    onChange={(_, newValue) => {
                      console.log('📝 Modo Declaración seleccionado:', newValue);
                      setAsignacionData({
                        ...asignacionData,
                        modoDeclaracion: newValue?.value?.toString() || ''
                      });
                    }}
                    loading={loadingModoDeclaracion}
                    disabled={loadingModoDeclaracion}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Modos Declaración"
                        placeholder={loadingModoDeclaracion ? "Cargando..." : "Seleccione"}
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'33px'
                          }  
                        }}
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingModoDeclaracion ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                        helperText={loadingModoDeclaracion ? "Cargando opciones del servidor..." : `${modoDeclaracionOptions.length} opciones disponibles`}
                      />
                    )}
                  />
                </Box>
                {/* Fecha Declaracion */}
                <Box sx={{ flex: '0 0 100px', maxWidth:'200px' }}>
                  <DatePicker
                    label="Fecha declaración"
                    value={asignacionData.fechaDeclaracion}
                    onChange={(newValue) => setAsignacionData({
                      ...asignacionData,
                      fechaDeclaracion: newValue
                    })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size:'small',
                        sx:{
                          '& .MuiInputBase-root':{
                            height:'33px'
                          }
                        }
                      }
                    }}
                  />
                </Box>
                {/* Fecha de Venta */}
                <Box sx={{ flex: '0 0 100px', maxWidth:'150px' }}>
                  <DatePicker
                    label="Fecha venta"
                    value={asignacionData.fechaVenta}
                    onChange={(newValue) => setAsignacionData({
                      ...asignacionData,
                      fechaVenta: newValue
                    })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size:'small',
                        sx:{
                          '& .MuiInputBase-root':{
                            height:'33'
                          }
                        },
                      }
                    }}
                  />
                </Box>
                {/* % Condomino */}
                <Box sx={{ flex: '0 0 100px', maxWidth:'120px' }}>
                  <TextField
                    label="% Condomino"
                    type="number"
                    value={asignacionData.porcentajeCondomino}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAsignacionData({
                        ...asignacionData,
                        porcentajeCondomino: value === '' ? 0 : Number(value)
                      });
                    }}
                    onFocus={(e) => e.target.select()}
                    size="small"
                    fullWidth
                    inputProps={{
                      min: 0,
                      max: 100,
                      step: 1
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '33px'
                      }
                    }}
                  />
                </Box>
                {/* Estado - Solo primera opción */}
                <Box sx={{ flex: '0 0 180px' }}>
                  <Autocomplete
                    options={estadosOptions.length > 0 ? [estadosOptions[0]] : []}
                    getOptionLabel={(option) => option?.label || ''}
                    value={estadosOptions.length > 0 ? estadosOptions[0] : null}
                    onChange={(_, newValue) => setAsignacionData({
                      ...asignacionData,
                      estado: String(newValue?.value || 'Activo')
                    })}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Estado"
                        placeholder="Seleccione"
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '33px'
                          }
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Es Pensionista */}
                <Box sx={{ flex: '0 0 140px' }}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Es Pensionista
                    </Typography>
                    <RadioGroup
                      row
                      value={asignacionData.esPensionista ? 'Si' : 'No'}
                      onChange={(e) => setAsignacionData({
                        ...asignacionData,
                        esPensionista: e.target.value === 'Si'
                      })}
                      sx={{ 
                        '& .MuiInputBase-root': { 
                          height: '33px', 
                          maxHeight:'50'
                        }
                      }}
                    >
                      <FormControlLabel value="Si" control={<Radio />} label="Si" />
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                  </Paper>
                </Box>
              </Box>

            
            </Stack>

            {/* Botones de acción */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleRegistrar}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AssignmentIcon />}
                sx={{ px: 4 }}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleNuevo}
                sx={{ px: 4 }}
              >
                Nuevo
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Modales */}
      <SelectorContribuyente
        isOpen={showContribuyenteModal}
        onClose={() => setShowContribuyenteModal(false)}
        onSelectContribuyente={handleSelectContribuyente}
        title="Seleccionar contribuyente"
      />

      <SelectorPredios
        open={showPredioModal}
        onClose={() => setShowPredioModal(false)}
        onSelect={handleSelectPredio}
      />
    </LocalizationProvider>
  );
};

export default AsignacionPredio;