// src/components/contribuyentes/PersonaForm.tsx - ACTUALIZADO CON CONSTANTES DINÁMICAS
import React, { useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  Paper,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Tooltip,
  Skeleton,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Badge as BadgeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Clear as ClearIcon,
  CalendarMonth as CalendarIcon,
  FamilyRestroom as FamilyRestroomIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { 
  useTipoDocumentoOptions, 
  useEstadoCivilOptions, 
  useSexoOptions 
} from '../../hooks/useConstantesOptions';

interface PersonaFormProps {
  form: UseFormReturn<any>;
  isJuridica?: boolean;
  isRepresentante?: boolean;
  onOpenDireccionModal: () => void;
  direccion: any;
  getDireccionTextoCompleto: (direccion: any, nFinca: string, otroNumero?: string) => string;
  disablePersonaFields?: boolean;
}

const PersonaFormMUI: React.FC<PersonaFormProps> = ({
  form,
  isJuridica = false,
  isRepresentante = false,
  onOpenDireccionModal,
  direccion,
  getDireccionTextoCompleto,
  disablePersonaFields = false
}) => {
  const theme = useTheme();
  const { control, watch, setValue, formState: { errors } } = form;

  const nFinca = watch('nFinca');
  const otroNumero = watch('otroNumero');
  const tipoDocumento = watch('tipoDocumento');

  // Cargar opciones dinámicas usando hooks personalizados
  const { 
    options: tipoDocumentoOptions, 
    loading: loadingTipoDoc, 
    error: errorTipoDoc 
  } = useTipoDocumentoOptions(isJuridica);

  const { 
    options: estadoCivilOptions, 
    loading: loadingEstadoCivil, 
    error: errorEstadoCivil 
  } = useEstadoCivilOptions();

  const { 
    options: sexoOptions, 
    loading: loadingSexo, 
    error: errorSexo 
  } = useSexoOptions();

  // Verificar si hay algún error de carga
  const hasLoadingErrors = errorTipoDoc || errorEstadoCivil || errorSexo;

  // Estilos comunes para los campos
  const fieldStyles = {
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.02)',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  };

  // Función helper para determinar el placeholder del número de documento
  const getNumeroDocumentoPlaceholder = () => {
    const selectedOption = tipoDocumentoOptions.find(opt => opt.value === tipoDocumento);
    if (!selectedOption) return 'Número';
    
    // Usar el código de la constante para determinar el formato
    switch (tipoDocumento) {
      case '4101': // DNI
        return '12345678';
      case '4102': // RUC
        return '20123456789';
      default:
        return 'Número';
    }
  };

  // Función helper para validar número de documento
  const getDocumentoPattern = () => {
    switch (tipoDocumento) {
      case '4101': // DNI
        return /^\d{8}$/;
      case '4102': // RUC
        return /^\d{11}$/;
      default:
        return /^.+$/;
    }
  };

  const getDocumentoMaxLength = () => {
    switch (tipoDocumento) {
      case '4101': // DNI
        return 8;
      case '4102': // RUC
        return 11;
      default:
        return 15;
    }
  };

  const getDocumentoErrorMessage = () => {
    const selectedOption = tipoDocumentoOptions.find(opt => opt.value === tipoDocumento);
    if (!selectedOption) return 'Formato inválido';
    
    switch (tipoDocumento) {
      case '4101': // DNI
        return 'DNI debe tener 8 dígitos';
      case '4102': // RUC
        return 'RUC debe tener 11 dígitos';
      default:
        return 'Formato inválido';
    }
  };

  return (
    <Box sx={{ maxWidth: '600px' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        {/* Header con ícono */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccountBalanceIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Datos del Contribuyente
          </Typography>
        </Box>

        {/* Mostrar alerta si hay errores de carga */}
        {hasLoadingErrors && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Algunas opciones no pudieron cargarse. Se están usando valores por defecto.
          </Alert>
        )}

        <Stack spacing={1.5}>
          {/* Primera fila - Tipo Doc, Número Doc, Nombres/Razón Social */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Tipo de Documento */}
            <Box sx={{ flex: '0 0 140px' }}>
              {loadingTipoDoc ? (
                <Skeleton variant="rounded" height={40} />
              ) : (
                <Controller
                  name="tipoDocumento"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      {...field}
                      id="tipo-documento"
                      label="Tipo Documento"
                      placeholder="Seleccione tipo"
                      options={tipoDocumentoOptions}
                      value={tipoDocumentoOptions.find(opt => opt.value === field.value) || null}
                      onChange={(newValue) => field.onChange(newValue?.value || '')}
                      getOptionLabel={(option) => option?.label || ''}
                      required
                      disabled={disablePersonaFields || loadingTipoDoc}
                      startIcon={<BadgeIcon sx={{ fontSize: 16 }} />}
                      error={!!errors.tipoDocumento || !!errorTipoDoc}
                      helperText={
                        errors.tipoDocumento?.message || 
                        (errorTipoDoc ? 'Error al cargar opciones' : '')
                      }
                      textFieldProps={{ sx: fieldStyles, size: 'small' }}
                    />
                  )}
                />
              )}
            </Box>

            {/* Número de Documento */}
            <Box sx={{ flex: '0 0 120px' }}>
              <Controller
                name="numeroDocumento"
                control={control}
                rules={{
                  required: 'Requerido',
                  pattern: {
                    value: getDocumentoPattern(),
                    message: getDocumentoErrorMessage()
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Número de Documento"
                    placeholder={getNumeroDocumentoPlaceholder()}
                    disabled={disablePersonaFields}
                    error={!!errors.numeroDocumento}
                    helperText={errors.numeroDocumento?.message}
                    sx={fieldStyles}
                    inputProps={{
                      maxLength: getDocumentoMaxLength()
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Box>

            {/* Nombres o Razón Social */}
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <Controller
                name={isJuridica ? 'razonSocial' : 'nombres'}
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label={isJuridica ? 'Razón Social' : 'Nombres'}
                    placeholder={isJuridica ? 'Ingrese razón social' : 'Ingrese nombres'}
                    disabled={disablePersonaFields}
                    error={!!errors[isJuridica ? 'razonSocial' : 'nombres']}
                    helperText={errors[isJuridica ? 'razonSocial' : 'nombres']?.message}
                    sx={fieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {isJuridica ? 
                            <BusinessIcon sx={{ fontSize: 16 }} /> : 
                            <PersonIcon sx={{ fontSize: 16 }} />
                          }
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Segunda fila - Solo para personas naturales */}
          {!isJuridica && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Apellido Paterno */}
              <Box sx={{ flex: '1 1 150px' }}>
                <Controller
                  name="apellidoPaterno"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Apellido Paterno"
                      placeholder="Apellido paterno"
                      disabled={disablePersonaFields}
                      error={!!errors.apellidoPaterno}
                      helperText={errors.apellidoPaterno?.message}
                      sx={fieldStyles}
                    />
                  )}
                />
              </Box>

              {/* Apellido Materno */}
              <Box sx={{ flex: '1 1 150px' }}>
                <Controller
                  name="apellidoMaterno"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Apellido Materno"
                      placeholder="Apellido materno"
                      disabled={disablePersonaFields}
                      error={!!errors.apellidoMaterno}
                      helperText={errors.apellidoMaterno?.message}
                      sx={fieldStyles}
                    />
                  )}
                />
              </Box>

              {/* Fecha de Nacimiento */}
              <Box sx={{ flex: '1 1 150px' }}>
                <Controller
                  name="fechaNacimiento"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Fecha Nacimiento"
                      disabled={disablePersonaFields}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!errors.fechaNacimiento,
                          helperText: errors.fechaNacimiento?.message,
                          sx: fieldStyles,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon sx={{ fontSize: 16 }} />
                              </InputAdornment>
                            ),
                          }
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          )}

          {/* Tercera fila - Datos adicionales (solo personas naturales) */}
          {!isJuridica && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Sexo */}
              <Box sx={{ flex: '0 0 120px' }}>
                {loadingSexo ? (
                  <Skeleton variant="rounded" height={40} />
                ) : (
                  <Controller
                    name="sexo"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        {...field}
                        id="sexo"
                        label="Sexo"
                        placeholder="Seleccione"
                        options={sexoOptions}
                        value={sexoOptions.find(opt => opt.value === field.value) || null}
                        onChange={(newValue) => field.onChange(newValue?.value || '')}
                        getOptionLabel={(option) => option?.label || ''}
                        disabled={disablePersonaFields || loadingSexo}
                        startIcon={<PersonIcon sx={{ fontSize: 16 }} />}
                        error={!!errors.sexo || !!errorSexo}
                        helperText={
                          errors.sexo?.message || 
                          (errorSexo ? 'Error al cargar opciones' : '')
                        }
                        textFieldProps={{ sx: fieldStyles, size: 'small' }}
                      />
                    )}
                  />
                )}
              </Box>

              {/* Estado Civil */}
              <Box sx={{ flex: '1 1 150px', maxWidth: '180px' }}>
                {loadingEstadoCivil ? (
                  <Skeleton variant="rounded" height={40} />
                ) : (
                  <Controller
                    name="estadoCivil"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        {...field}
                        id="estado-civil"
                        label="Estado Civil"
                        placeholder="Seleccione estado"
                        options={estadoCivilOptions}
                        value={estadoCivilOptions.find(opt => opt.value === field.value) || null}
                        onChange={(newValue) => field.onChange(newValue?.value || '')}
                        getOptionLabel={(option) => option?.label || ''}
                        disabled={disablePersonaFields || loadingEstadoCivil}
                        startIcon={<FamilyRestroomIcon sx={{ fontSize: 16 }} />}
                        error={!!errors.estadoCivil || !!errorEstadoCivil}
                        helperText={
                          errors.estadoCivil?.message || 
                          (errorEstadoCivil ? 'Error al cargar opciones' : '')
                        }
                        textFieldProps={{ sx: fieldStyles, size: 'small' }}
                      />
                    )}
                  />
                )}
              </Box>

              {/* Teléfono */}
              <Box sx={{ flex: '1 1 120px', maxWidth: '160px' }}>
                <Controller
                  name="telefono"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Teléfono"
                      placeholder="999 999 999"
                      disabled={disablePersonaFields}
                      error={!!errors.telefono}
                      helperText={errors.telefono?.message}
                      sx={fieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ fontSize: 16 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          )}

          {/* Sección de Dirección */}
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            backgroundColor: theme.palette.action.hover,
            border: `1px dashed ${theme.palette.divider}`
          }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Dirección Fiscal
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onOpenDireccionModal}
                  disabled={disablePersonaFields}
                  startIcon={<LocationIcon sx={{ fontSize: 16 }} />}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {direccion ? 'Cambiar' : 'Seleccionar'}
                </Button>
              </Box>

              {/* Campos de número de finca */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Controller
                  name="nFinca"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="N° Finca"
                      placeholder="123"
                      disabled={disablePersonaFields || !direccion}
                      sx={{ ...fieldStyles, width: 100 }}
                    />
                  )}
                />
                <Controller
                  name="otroNumero"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Otro N°"
                      placeholder="Dpto, Int"
                      disabled={disablePersonaFields || !direccion}
                      sx={fieldStyles}
                    />
                  )}
                />
              </Box>

              {/* Mostrar dirección seleccionada */}
              {direccion && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    py: 0.5,
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                >
                  <Typography variant="body2" component="div">
                    <strong>Dirección seleccionada:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {direccion.descripcion || getDireccionTextoCompleto(direccion, nFinca, otroNumero)}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Box>

          {/* Indicador de carga general */}
          {(loadingTipoDoc || loadingEstadoCivil || loadingSexo) && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Cargando opciones...
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default PersonaFormMUI;