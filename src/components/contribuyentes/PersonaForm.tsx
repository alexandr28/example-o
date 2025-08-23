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
  CircularProgress,
  Autocomplete
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
  Warning as WarningIcon,
  Save as SaveIcon
} from '@mui/icons-material';
// import SearchableSelect from '../ui/SearchableSelect'; // Reemplazado por Autocomplete
import { 
  useTipoDocumentoOptions, 
  useEstadoCivilOptions, 
  useSexoOptions 
} from '../../hooks/useConstantesOptions';
import { usePersonas } from '../../hooks/usePersonas';
import { useContribuyentes } from '../../hooks/useContribuyentes';

interface PersonaFormProps {
  form: UseFormReturn<any>;
  isJuridica?: boolean;
  isRepresentante?: boolean;
  onOpenDireccionModal: () => void;
  direccion: any;
  getDireccionTextoCompleto: (direccion: any, nFinca: string, otroNumero?: string) => string;
  disablePersonaFields?: boolean;
  onGuardar?: (data: { persona: any; contribuyente?: any }) => void | Promise<void>;
  showGuardarButton?: boolean;
}

const PersonaFormMUI: React.FC<PersonaFormProps> = ({
  form,
  isJuridica = false,
  isRepresentante = false,
  onOpenDireccionModal,
  direccion,
  getDireccionTextoCompleto,
  disablePersonaFields = false,
  onGuardar,
  showGuardarButton = true
}) => {
  const theme = useTheme();
  const { control, watch, setValue, formState: { errors }, handleSubmit } = form;

  const nFinca = watch('nFinca');
  const otroNumero = watch('otroNumero');
  const tipoDocumento = watch('tipoDocumento');

  // Hook para gestión de personas
  const { crearPersonaDesdeFormulario, loadingCrear, error: errorPersona } = usePersonas();
  
  // Hook para gestión de contribuyentes
  const { 
    crearContribuyenteDesdePersona, 
    loading: loadingContribuyente, 
    error: errorContribuyente 
  } = useContribuyentes();

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

  // Función para manejar el guardado (persona + contribuyente)
  const handleGuardar = async (datosFormulario: any) => {
    try {
      console.log('💾 [PersonaForm] Iniciando guardado:', datosFormulario);

      // Validar datos requeridos
      if (!datosFormulario.numeroDocumento || !datosFormulario.tipoDocumento) {
        throw new Error('Número de documento y tipo de documento son requeridos');
      }

      if (!isJuridica && !datosFormulario.nombres) {
        throw new Error('El nombre es requerido para personas naturales');
      }

      if (isJuridica && !datosFormulario.razonSocial) {
        throw new Error('La razón social es requerida para personas jurídicas');
      }

      if (!direccion) {
        throw new Error('Debe seleccionar una dirección');
      }

      // Agregar datos adicionales al formulario
      const datosCompletos = {
        ...datosFormulario,
        isJuridica,
        direccion,
        nFinca,
        otroNumero
      };

      console.log('📋 [PersonaForm] Datos completos para enviar:', datosCompletos);

      // PASO 1: Crear la persona
      const personaCreada = await crearPersonaDesdeFormulario(datosCompletos);

      if (personaCreada) {
        console.log('✅ [PersonaForm] Persona creada exitosamente:', personaCreada);
        
        // PASO 2: Crear contribuyente automáticamente
        console.log('🔄 [PersonaForm] Creando contribuyente automáticamente...');
        
        const contribuyenteCreado = await crearContribuyenteDesdePersona(personaCreada, datosCompletos);
        
        if (contribuyenteCreado) {
          console.log('✅ [PersonaForm] Contribuyente creado exitosamente:', contribuyenteCreado);
        }
        
        // PASO 3: Llamar al callback con ambos objetos
        if (onGuardar) {
          await onGuardar({
            persona: personaCreada,
            contribuyente: contribuyenteCreado
          });
        }
      }

    } catch (error: any) {
      console.error('❌ [PersonaForm] Error al guardar:', error);
      // El error ya se maneja en los hooks con NotificationService
    }
  };

  return (
    <Box sx={{ Width: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >

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
            <Box sx={{ flex: '0 0 120px' }}>
              {loadingTipoDoc ? (
                <Skeleton variant="rounded" height={40} />
              ) : (
                <Controller
                  name="tipoDocumento"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={tipoDocumentoOptions}
                      getOptionLabel={(option) => option?.label || ''}
                      value={tipoDocumentoOptions.find(opt => opt.value === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.value || '')}
                      disabled={disablePersonaFields || loadingTipoDoc}
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tipo Documento"
                          placeholder="Seleccione tipo"
                          required
                          error={!!errors.tipoDocumento || !!errorTipoDoc}
                          helperText={
                            (errors.tipoDocumento?.message as string) ||
                            (errorTipoDoc ? 'Error al cargar opciones' : '')
                          }
                          sx={fieldStyles}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon sx={{ fontSize: 16 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
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
                    helperText={String(errors.numeroDocumento?.message || '')}
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
            <Box sx={{ flex: '1 1 160px', maxWidth: '200px' }}>
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
                    helperText={String((errors as any)[isJuridica ? 'razonSocial' : 'nombres']?.message || '')}
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

            {/* Para Persona Jurídica: mostrar campos adicionales en primera fila */}
            {isJuridica && (
              <>
                {/* Teléfono */}
                <Box sx={{ flex: '0 0 120px' }}>
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
                        helperText={String(errors.telefono?.message || '')}
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

                {/* Botón Seleccionar/Cambiar */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={onOpenDireccionModal}
                    disabled={disablePersonaFields}
                    startIcon={<LocationIcon sx={{ fontSize: 16 }} />}
                    sx={{ 
                      fontSize: '0.75rem',
                      height: '32px',
                      minHeight: '32px',
                      minWidth: '120px',
                      px: 2,
                      marginTop: '5px'
                    }}
                  >
                    {direccion ? 'Cambiar' : 'Seleccionar'}
                  </Button>
                </Box>

                {/* N° Finca */}
                <Box sx={{ flex: '0 0 100px' }}>
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
                        fullWidth
                        sx={fieldStyles}
                      />
                    )}
                  />
                </Box>

                {/* Otro N° */}
                <Box sx={{ flex: '0 0 120px' }}>
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
                        fullWidth
                        sx={fieldStyles}
                      />
                    )}
                  />
                </Box>
              </>
            )}

            {/* Para Persona Natural: mostrar campos adicionales */}
            {!isJuridica && (
              <>
                {/* Apellido Paterno */}
                <Box sx={{ flex: '0 0 120px', maxWidth: '120px' }}>
                  <Controller
                    name="apellidoPaterno"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Ap. Paterno"
                        placeholder="Ap. paterno"
                        disabled={disablePersonaFields}
                        error={!!errors.apellidoPaterno}
                        helperText={String(errors.apellidoPaterno?.message || '')}
                        sx={fieldStyles}
                      />
                    )}
                  />
                </Box>

                {/* Apellido Materno */}
                <Box sx={{ flex: '0 0 120px', maxWidth: '120px' }}>
                  <Controller
                    name="apellidoMaterno"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Ap. Materno"
                        placeholder="Ap. materno"
                        disabled={disablePersonaFields}
                        error={!!errors.apellidoMaterno}
                        helperText={String(errors.apellidoMaterno?.message || '')}
                        sx={fieldStyles}
                      />
                    )}
                  />
                </Box>

                {/* Fecha de Nacimiento */}
                <Box sx={{ flex: '0 0 140px', maxWidth: '140px' }}>
                  <Controller
                    name="fechaNacimiento"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Fecha Nac."
                        disabled={disablePersonaFields}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: !!errors.fechaNacimiento,
                            helperText: String(errors.fechaNacimiento?.message || ''),
                            sx: {
                              ...fieldStyles,
                              '& .MuiInputBase-input': {
                                fontSize: '0.75rem',
                                padding: '6px 10px'
                              }
                            },
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon sx={{ fontSize: 14 }} />
                                </InputAdornment>
                              ),
                            }
                          },
                          popper: {
                            placement: 'bottom-start'
                          }
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Sexo */}
                <Box sx={{ flex: '0 0 120px' }}>
                  {loadingSexo ? (
                    <Skeleton variant="rounded" height={40} />
                  ) : (
                    <Controller
                      name="sexo"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          options={sexoOptions}
                          getOptionLabel={(option) => option?.label || ''}
                          value={sexoOptions.find(opt => opt.value === field.value) || null}
                          onChange={(_, newValue) => field.onChange(newValue?.value || '')}
                          disabled={disablePersonaFields || loadingSexo}
                          size="small"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Sexo"
                              placeholder="Seleccione"
                              error={!!errors.sexo || !!errorSexo}
                              helperText={
                                (errors.sexo?.message as string) ||
                                (errorSexo ? 'Error al cargar opciones' : '')
                              }
                              sx={fieldStyles}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FamilyRestroomIcon sx={{ fontSize: 16 }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                </Box>
              </>
            )}
          </Box>

          {/* Segunda fila - Solo para personas naturales */}
          {!isJuridica && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'stretch' }}>
             

             

              {/* Estado Civil */}
              <Box sx={{ flex: '0 0 120px' }}>
                {loadingEstadoCivil ? (
                  <Skeleton variant="rounded" height={40} />
                ) : (
                  <Controller
                    name="estadoCivil"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={estadoCivilOptions}
                        getOptionLabel={(option) => option?.label || ''}
                        value={estadoCivilOptions.find(opt => opt.value === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue?.value || '')}
                        disabled={disablePersonaFields || loadingEstadoCivil}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Est. Civil"
                            placeholder="Seleccione"
                            error={!!errors.estadoCivil || !!errorEstadoCivil}
                            helperText={
                              (errors.estadoCivil?.message as string) ||
                              (errorEstadoCivil ? 'Error al cargar opciones' : '')
                            }
                            sx={{
                              ...fieldStyles,
                              '& .MuiInputBase-root': {
                                ...fieldStyles['& .MuiInputBase-root'],
                                height: '32px',
                                minHeight: '32px'
                              }
                            }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FamilyRestroomIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Box>

              {/* Teléfono */}
              <Box sx={{ flex: '0 0 120px' }}>
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
                    helperText={String(errors.telefono?.message || '')}
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

               {/* Botón Seleccionar/Cambiar */}
               <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onOpenDireccionModal}
                  disabled={disablePersonaFields}
                  startIcon={<LocationIcon sx={{ fontSize: 16 }} />}
                  sx={{ 
                    fontSize: '0.75rem',
                    height: '32px',
                    minHeight: '32px',
                    minWidth: '120px',
                    px: 2,
                    marginTop: '5px'
                  }}
                >
                  {direccion ? 'Cambiar' : 'Seleccionar'}
                </Button>
              </Box>

              {/* N° Finca */}
              <Box sx={{ flex: '0 0 100px' }}>
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
                      fullWidth
                      sx={fieldStyles}
                    />
                  )}
                />
              </Box>

              {/* Otro N° */}
              <Box sx={{ flex: '0 0 120px' }}>
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
                      fullWidth
                      sx={fieldStyles}
                    />
                  )}
                />
              </Box>

             
            </Box>
          )}
         
       

          {/* Tercera fila - Dirección seleccionada (ancho completo) */}
          {direccion && (
            <Box sx={{ width: '100%' }}>
              <Alert 
                severity="info" 
                sx={{ 
                  py: 1,
                  px: 1.5,
                  minHeight: 'auto',
                  '& .MuiAlert-message': { 
                    width: '100%',
                    py: 0
                  },
                  '& .MuiAlert-icon': {
                    fontSize: '1rem',
                    paddingTop: 0
                  }
                }}
              >
                <Typography variant="caption" component="div" sx={{ fontWeight: 600, fontSize: '0.75rem', mb: 0.5 }}>
                  📍 Dirección Fiscal seleccionada:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {/* Sector */}
                  {direccion.sector && (
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                      <strong>Sector:</strong> {direccion.sector}
                    </Typography>
                  )}
                  
                  {/* Barrio */}
                  {direccion.barrio && (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        <strong>Barrio:</strong> {direccion.barrio}
                      </Typography>
                    </>
                  )}
                  
                  {/* Tipo de Vía y Nombre */}
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                    <strong>{direccion.tipoVia || 'CALLE'}:</strong> {direccion.nombreVia}
                  </Typography>
                  
                  {/* Cuadra */}
                  {direccion.cuadra && (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        <strong>Cuadra:</strong> {direccion.cuadra}
                      </Typography>
                    </>
                  )}
                  
                  {/* Lado */}
                  {direccion.lado && direccion.lado !== '-' && (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        <strong>Lado:</strong> {direccion.lado}
                      </Typography>
                    </>
                  )}
                  
                  {/* Lotes */}
                  {(direccion.loteInicial || direccion.loteFinal) && (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        <strong>Lotes:</strong> {direccion.loteInicial || 1} - {direccion.loteFinal || 1}
                      </Typography>
                    </>
                  )}

                  {/* N° Finca y Otro N° si existen */}
                  {nFinca && (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'primary.main' }}>
                        <strong>N° Finca:</strong> {nFinca}
                      </Typography>
                    </>
                  )}
                  
                  {otroNumero && (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>•</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'primary.main' }}>
                        <strong>Otro N°:</strong> {otroNumero}
                      </Typography>
                    </>
                  )}
                </Box>
              </Alert>
            </Box>
          )}

          {/* Errores si existen */}
          {errorPersona && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorPersona}
            </Alert>
          )}
          
          {errorContribuyente && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorContribuyente}
            </Alert>
          )}

          {/* Botón de Guardar */}
          {showGuardarButton && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit(handleGuardar)}
                disabled={disablePersonaFields || loadingCrear || loadingContribuyente || !direccion}
                startIcon={(loadingCrear || loadingContribuyente) ? <CircularProgress size={16} /> : <SaveIcon />}
                sx={{ 
                  minWidth: '100px',
                  height: '36px'
                }}
              >
                {loadingCrear 
                  ? 'Guardando...' 
                  : loadingContribuyente 
                    ? 'Procesando...'
                    : 'Guardar'
                }
              </Button>
            </Box>
          )}

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