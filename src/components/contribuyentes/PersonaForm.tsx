// src/components/contribuyentes/PersonaFormMUI.tsx
import React from 'react';
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
  Tooltip
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
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';

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

  // Opciones para los selectores
  const tipoDocumentoOptions = isJuridica
    ? [{ id: 'RUC', label: 'RUC', descripcion: 'Registro Único de Contribuyentes' }]
    : [
        { id: 'DNI', label: 'DNI', descripcion: 'Documento Nacional de Identidad' },
        { id: 'CE', label: 'Carnet de Extranjería', descripcion: 'Para extranjeros residentes' },
        { id: 'PASAPORTE', label: 'Pasaporte', descripcion: 'Documento internacional' }
      ];

  const estadoCivilOptions = [
    { id: 'Soltero/a', label: 'Soltero/a' },
    { id: 'Casado/a', label: 'Casado/a' },
    { id: 'Viudo/a', label: 'Viudo/a' },
    { id: 'Divorciado/a', label: 'Divorciado/a' },
    { id: 'Conviviente', label: 'Conviviente' }
  ];

  const tipoDocumento = watch('tipoDocumento');

  // Estilos comunes para los campos
  const fieldStyles = {
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* Header con ícono */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountBalanceIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Datos del Contribuyente
        </Typography>
      </Box>

      <Stack spacing={2}>
        {/* Primera fila - Tipo Doc, Número Doc, Nombres/Razón Social */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '0 0 170px' }}>
            <Controller
              name="tipoDocumento"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  id="tipo-documento"
                  label="Tipo de Documento"
                  options={tipoDocumentoOptions}
                  value={tipoDocumentoOptions.find(opt => opt.id === field.value) || null}
                  onChange={(newValue) => field.onChange(newValue?.id || '')}
                  required
                  disabled={disablePersonaFields}
                  startIcon={<BadgeIcon sx={{ fontSize: 16 }} />}
                  error={!!errors.tipoDocumento}
                  helperText={typeof errors.tipoDocumento?.message === 'string' ? errors.tipoDocumento.message : ''}
                  textFieldProps={{ sx: fieldStyles, size: 'small' }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: '0 0 150px' }}>
            <Controller
              name="numeroDocumento"
              control={control}
              rules={{
                required: 'Requerido',
                pattern: {
                  value: tipoDocumento === 'DNI' ? /^\d{8}$/ : tipoDocumento === 'RUC' ? /^\d{11}$/ : /^.+$/,
                  message: tipoDocumento === 'DNI' ? 'DNI: 8 dígitos' : 
                           tipoDocumento === 'RUC' ? 'RUC: 11 dígitos' : 
                           'Formato inválido'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Número de Documento"
                  placeholder={
                    tipoDocumento === 'DNI' ? '12345678' :
                    tipoDocumento === 'RUC' ? '20123456789' :
                    'Número'
                  }
                  error={!!errors.numeroDocumento}
                  helperText={typeof errors.numeroDocumento?.message === 'string' ? errors.numeroDocumento.message : ''}
                  disabled={disablePersonaFields}
                  sx={fieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ fontSize: 16 }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: '1 1 auto', minWidth: '200px' }}>
            {isJuridica ? (
              <Controller
                name="razonSocial"
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Razón Social"
                    placeholder="Ingrese razón social"
                    error={!!errors.razonSocial}
                    helperText={typeof errors.razonSocial?.message === 'string' ? errors.razonSocial.message : ''}
                    disabled={disablePersonaFields}
                    sx={fieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ fontSize: 16 }} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            ) : (
              <Controller
                name="nombres"
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Nombres"
                    placeholder="Ingrese nombres"
                    error={!!errors.nombres}
                    helperText={typeof errors.nombres?.message === 'string' ? errors.nombres.message : ''}
                    disabled={disablePersonaFields}
                    sx={fieldStyles}
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
            )}
          </Box>
        </Box>

        {/* Segunda fila - Apellidos y Fecha (solo personas naturales) */}
        {!isJuridica && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Controller
                name="apellidoPaterno"
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Apellido Paterno"
                    placeholder="Apellido paterno"
                    error={!!errors.apellidoPaterno}
                    helperText={typeof errors.apellidoPaterno?.message === 'string' ? errors.apellidoPaterno.message : ''}
                    disabled={disablePersonaFields}
                    sx={fieldStyles}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: '1 1 200px' }}>
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
                    sx={fieldStyles}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: '0 0 180px' }}>
              <Controller
                name="fechaNacimiento"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Fecha de Nacimiento"
                    format="dd/MM/yyyy"
                    disabled={disablePersonaFields}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: "DD/MM/YYYY",
                        error: !!errors.fechaNacimiento,
                        helperText: typeof errors.fechaNacimiento?.message === 'string' ? errors.fechaNacimiento.message : '',
                        sx: fieldStyles,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon sx={{ fontSize: 16 }} />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        )}

        {/* Tercera fila - Sexo, Estado Civil y Teléfono */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {!isJuridica && (
            <>
              <Box sx={{ flex: '0 0 auto' }}>
                <FormControl component="fieldset" size="small">
                  <FormLabel component="legend" sx={{ fontSize: '0.75rem', mb: 0 }}>Sexo</FormLabel>
                  <Controller
                    name="sexo"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        row
                        sx={{ gap: 1 }}
                      >
                        <FormControlLabel 
                          value="Masculino" 
                          control={<Radio size="small" disabled={disablePersonaFields} sx={{ py: 0.5 }} />} 
                          label={<Typography variant="body2">Masculino</Typography>}
                          sx={{ mr: 1 }}
                        />
                        <FormControlLabel 
                          value="Femenino" 
                          control={<Radio size="small" disabled={disablePersonaFields} sx={{ py: 0.5 }} />} 
                          label={<Typography variant="body2">Femenino</Typography>}
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 200px' }}>
                <Controller
                  name="estadoCivil"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      {...field}
                      id="estado-civil"
                      label="Estado Civil"
                      options={estadoCivilOptions}
                      value={estadoCivilOptions.find(opt => opt.id === field.value) || null}
                      onChange={(newValue) => field.onChange(newValue?.id || '')}
                      disabled={disablePersonaFields}
                      startIcon={<FamilyRestroomIcon sx={{ fontSize: 16 }} />}
                      textFieldProps={{ sx: fieldStyles, size: 'small' }}
                    />
                  )}
                />
              </Box>
            </>
          )}

          <Box sx={{ flex: isJuridica ? '0 0 250px' : '1 1 180px' }}>
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

        {/* Sección de Dirección Fiscal - Más compacta */}
        <Box sx={{ mt: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 500, 
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LocationIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Dirección Fiscal
          </Typography>
          
          {/* Botón Seleccionar, N° Finca, Otro Número - En una sola línea */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '0 0 180px' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={onOpenDireccionModal}
                disabled={disablePersonaFields}
                startIcon={<LocationIcon sx={{ fontSize: 16 }} />}
                size="small"
                sx={{ 
                  height: '40px',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Seleccione Dirección
              </Button>
            </Box>

            <Box sx={{ flex: '0 0 120px' }}>
              <Controller
                name="nFinca"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="N° Finca"
                    placeholder="123"
                    disabled={disablePersonaFields || !direccion}
                    sx={fieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ fontSize: 16 }} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: '1 1 auto', minWidth: '150px' }}>
              <Controller
                name="otroNumero"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Otro Número"
                    placeholder="Dpto, Int, etc."
                    disabled={disablePersonaFields || !direccion}
                    sx={fieldStyles}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Campo de dirección y alerta - Solo si hay dirección */}
          {direccion && (
            <Box sx={{ mt: 1.5 }}>
              {(nFinca || otroNumero) ? (
                <Alert 
                  severity="info" 
                  icon={<LocationIcon sx={{ fontSize: 18 }} />}
                  sx={{ 
                    py: 0.5,
                    '& .MuiAlert-message': { py: 0.5 },
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(33, 150, 243, 0.08)' 
                      : 'rgba(33, 150, 243, 0.08)',
                    '& .MuiAlert-icon': {
                      color: theme.palette.info.main
                    }
                  }}
                >
                  <Typography variant="body2">
                    <strong>Dirección:</strong> {getDireccionTextoCompleto(direccion, nFinca, otroNumero)}
                  </Typography>
                </Alert>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección seleccionada"
                  value={direccion.descripcion}
                  disabled
                  sx={{
                    ...fieldStyles,
                    '& .MuiInputBase-root': {
                      backgroundColor: theme.palette.action.disabledBackground,
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Limpiar dirección">
                          <IconButton
                            size="small"
                            onClick={() => setValue('direccion', null)}
                            disabled={disablePersonaFields}
                          >
                            <ClearIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default PersonaFormMUI;