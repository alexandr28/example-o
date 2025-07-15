// src/components/contribuyentes/PersonaForm.tsx - ACTUALIZADO
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
      {/* Header con ícono - REDUCIDO EL MARGEN */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AccountBalanceIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 18 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Datos del Contribuyente
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {/* Primera fila - Tipo Doc, Número Doc, Nombres/Razón Social */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Box sx={{ flex: '0 0 140px' }}>
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
                  value={tipoDocumentoOptions.find(opt => opt.id === field.value) || null}
                  onChange={(newValue) => field.onChange(newValue?.id || '')}
                  getOptionLabel={(option) => option?.label || ''}
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

          <Box sx={{ flex: '0 0 120px' }}>
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
                  disabled={disablePersonaFields}
                  error={!!errors.numeroDocumento}
                  helperText={typeof errors.numeroDocumento?.message === 'string' ? errors.numeroDocumento.message : ''}
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
          </Box>

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
                  helperText={
                    typeof errors[isJuridica ? 'razonSocial' : 'nombres']?.message === 'string' 
                      ? errors[isJuridica ? 'razonSocial' : 'nombres'].message 
                      : ''
                  }
                  sx={fieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isJuridica ? <BusinessIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Segunda fila - Apellidos (solo para persona natural) */}
        {!isJuridica && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
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
                    sx={fieldStyles}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
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
          </Box>
        )}

        {/* Tercera fila - Fecha Nacimiento, Sexo, Estado Civil */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Fecha Nacimiento - AJUSTADO EL TAMAÑO */}
          {!isJuridica && (
            <Box sx={{ flex: '0 0 140px' }}>
              <Controller
                name="fechaNacimiento"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Fecha Nacimiento"
                    format="dd/MM/yyyy"
                    disableFuture
                    disabled={disablePersonaFields}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: fieldStyles,
                        placeholder: 'DD/MM/AAAA',
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon sx={{ fontSize: 16 }} />
                            </InputAdornment>
                          ),
                          endAdornment: field.value && !disablePersonaFields && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => field.onChange(null)}
                                edge="end"
                              >
                                <ClearIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </InputAdornment>
                          )
                        },
                        error: !!errors.fechaNacimiento,
                        helperText: typeof errors.fechaNacimiento?.message === 'string' ? errors.fechaNacimiento.message : ''
                      }
                    }}
                  />
                )}
              />
            </Box>
          )}

          {/* Sexo */}
          {!isJuridica && (
            <Box sx={{ flex: '0 0 auto' }}>
              <FormControl component="fieldset" size="small">
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                  Sexo
                </FormLabel>
                <Controller
                  name="sexo"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup 
                      {...field} 
                      row 
                      sx={{ gap: 2 }}
                    >
                      <FormControlLabel 
                        value="Masculino" 
                        control={<Radio size="small" disabled={disablePersonaFields} sx={{ py: 0.5 }} />} 
                        label={<Typography variant="body2">Masculino</Typography>}
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
          )}

          {/* Estado Civil */}
          {!isJuridica && (
            <Box sx={{ flex: '1 1 150px', maxWidth: '180px' }}>
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
                    value={estadoCivilOptions.find(opt => opt.id === field.value) || null}
                    onChange={(newValue) => field.onChange(newValue?.id || '')}
                    getOptionLabel={(option) => option?.label || ''}
                    disabled={disablePersonaFields}
                    startIcon={<FamilyRestroomIcon sx={{ fontSize: 16 }} />}
                    textFieldProps={{ sx: fieldStyles, size: 'small' }}
                  />
                )}
              />
            </Box>
          )}

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

        <Divider sx={{ my: 0.5 }} />

        {/* Sección de Dirección Fiscal */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ mr: 1, color: theme.palette.success.main, fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Dirección Fiscal
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {/* Primera fila: Botón seleccionar + N° Finca + Otro Número */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              {/* Botón para seleccionar dirección */}
              <Button
                variant="outlined"
                color="primary"
                onClick={onOpenDireccionModal}
                disabled={disablePersonaFields}
                startIcon={<HomeIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderStyle: 'dashed',
                  minWidth: '180px',
                  height: '40px'
                }}
              >
                {direccion ? 'Cambiar Dirección' : 'Seleccione Dirección'}
              </Button>

              {/* N° Finca */}
              <Box sx={{ flex: '0 0 100px' }}>
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
                    />
                  )}
                />
              </Box>

              {/* Otro Número */}
              <Box sx={{ flex: '1', maxWidth: '150px' }}>
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


      </Stack>
    </Paper>
    </Box>
  );
};

export default PersonaFormMUI;