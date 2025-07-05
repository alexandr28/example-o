// src/components/contribuyentes/PersonaFormMUI.tsx
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  alpha,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
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
  Search as SearchIcon,
  Wc as WcIcon,
  FamilyRestroom as FamilyRestroomIcon,
  CalendarMonth as CalendarIcon
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

  return (
    <Grid container spacing={2}>
      {/* Primera fila - Tipo Documento, Número Documento, Nombres/Razón Social */}
      <Grid item xs={12} md={4}>
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
              startIcon={<BadgeIcon />}
              error={!!errors.tipoDocumento}
              helperText={errors.tipoDocumento?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller
          name="numeroDocumento"
          control={control}
          rules={{
            required: 'El número de documento es requerido',
            pattern: {
              value: tipoDocumento === 'DNI' ? /^\d{8}$/ : tipoDocumento === 'RUC' ? /^\d{11}$/ : /^.+$/,
              message: tipoDocumento === 'DNI' ? 'El DNI debe tener 8 dígitos' : 
                       tipoDocumento === 'RUC' ? 'El RUC debe tener 11 dígitos' : 
                       'Formato inválido'
            }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Número de Documento"
              placeholder={
                tipoDocumento === 'DNI' ? '12345678' :
                tipoDocumento === 'RUC' ? '20123456789' :
                'Ingrese número'
              }
              error={!!errors.numeroDocumento}
              helperText={errors.numeroDocumento?.message}
              disabled={disablePersonaFields}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon />
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        {isJuridica ? (
          <Controller
            name="razonSocial"
            control={control}
            rules={{ required: 'La razón social es requerida' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Razón Social"
                placeholder="Ingrese razón social"
                error={!!errors.razonSocial}
                helperText={errors.razonSocial?.message}
                disabled={disablePersonaFields}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
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
            rules={{ required: 'Los nombres son requeridos' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nombres"
                placeholder="Ingrese nombres"
                error={!!errors.nombres}
                helperText={errors.nombres?.message}
                disabled={disablePersonaFields}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        )}
      </Grid>

      {/* Segunda fila - Apellidos y Fecha (solo personas naturales) */}
      {!isJuridica && (
        <>
          <Grid item xs={12} md={4}>
            <Controller
              name="apellidoPaterno"
              control={control}
              rules={{ required: 'El apellido paterno es requerido' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Apellido Paterno"
                  placeholder="Apellido paterno"
                  error={!!errors.apellidoPaterno}
                  helperText={errors.apellidoPaterno?.message}
                  disabled={disablePersonaFields}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Controller
              name="apellidoMaterno"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Apellido Materno"
                  placeholder="Apellido materno"
                  disabled={disablePersonaFields}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
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
                      placeholder: "DD/MM/YYYY",
                      error: !!errors.fechaNacimiento,
                      helperText: errors.fechaNacimiento?.message,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Tercera fila - Sexo, Estado Civil, Teléfono */}
          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Sexo</FormLabel>
              <Controller
                name="sexo"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    row
                    disabled={disablePersonaFields}
                  >
                    <FormControlLabel value="Masculino" control={<Radio size="small" />} label="Masculino" />
                    <FormControlLabel value="Femenino" control={<Radio size="small" />} label="Femenino" />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
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
                  startIcon={<FamilyRestroomIcon />}
                />
              )}
            />
          </Grid>
        </>
      )}

      {/* Teléfono - Para personas jurídicas va después de la razón social */}
      <Grid item xs={12} md={4}>
        <Controller
          name="telefono"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Teléfono"
              placeholder="999 999 999"
              disabled={disablePersonaFields}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </Grid>

      {/* Sección de Dirección Fiscal */}
      <Grid item xs={12}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mb: 2, fontWeight: 500 }}>
            Dirección Fiscal
          </Typography>
          
          <Grid container spacing={2}>
            {/* Cuarta fila - Botón Seleccionar, N° Finca, Otro Número */}
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                fullWidth
                onClick={onOpenDireccionModal}
                disabled={disablePersonaFields}
                startIcon={<LocationIcon />}
                sx={{ height: '56px' }}
              >
                Seleccione Dirección
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="nFinca"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="N° Finca"
                    placeholder="123"
                    disabled={disablePersonaFields || !direccion}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="otroNumero"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Otro Número"
                    placeholder="Dpto, Int, etc."
                    disabled={disablePersonaFields || !direccion}
                  />
                )}
              />
            </Grid>

            {/* Quinta fila - Campo de dirección (solo lectura) */}
            {direccion && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={direccion.descripcion}
                  disabled
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setValue('direccion', null)}
                          disabled={disablePersonaFields}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}

            {/* Dirección completa */}
            {direccion && (nFinca || otroNumero) && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<LocationIcon />}>
                  <Typography variant="body2">
                    <strong>Dirección completa:</strong> {getDireccionTextoCompleto(direccion, nFinca, otroNumero)}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PersonaFormMUI;