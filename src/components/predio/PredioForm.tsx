// src/components/predio/PredioForm.tsx
import React, { useState, useCallback, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stack,
  Typography,
  Divider,
  InputAdornment,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Domain as DomainIcon,
  CalendarMonth as CalendarIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Terrain as TerrainIcon,
  Home as HomeIcon,
  Groups as GroupsIcon,
  ApartmentOutlined as ApartmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePredioAPI } from '../../hooks/usePredioAPI';
import { NotificationService } from '../utils/Notification';
import SelectorDirecciones from '../modal/SelectorDirecciones';

// Interfaces
interface Direccion {
  id: number;
  codDireccion?: number;
  descripcion: string;
  nombreCalle?: string;
  numeracion?: string;
}

interface PredioFormData {
  anioAdquisicion: string;
  fechaAdquisicion: Date | null;
  condicionPropiedad: string;
  direccion: Direccion | null;
  nFinca: string;
  otroNumero: string;
  arancel: number;
  tipoPredio: string;
  conductor: string;
  usoPredio: string;
  areaTerreno: number;
  numeroPisos: number;
  numeroCondominos: number;
  rutaFotografiaPredio?: string;
  rutaPlanoPredio?: string;
}

// Props del componente
interface PredioFormProps {
  codPersona?: number; // ID del contribuyente seleccionado
}

// Opciones para los selects
const CONDICION_PROPIEDAD_OPTIONS = [
  { value: 'PROPIETARIO', label: 'Propietario' },
  { value: 'POSEEDOR', label: 'Poseedor' },
  { value: 'ARRENDATARIO', label: 'Arrendatario' },
  { value: 'USUFRUCTUARIO', label: 'Usufructuario' },
  { value: 'OTRO', label: 'Otro' }
];

const TIPO_PREDIO_OPTIONS = [
  { value: 'CASA_HABITACION', label: 'Casa Habitación' },
  { value: 'COMERCIO', label: 'Comercio' },
  { value: 'INDUSTRIA', label: 'Industria' },
  { value: 'TERRENO_SIN_CONSTRUIR', label: 'Terreno sin construir' },
  { value: 'OTROS', label: 'Otros' }
];

const CONDUCTOR_OPTIONS = [
  { value: 'PROPIETARIO', label: 'Propietario' },
  { value: 'INQUILINO', label: 'Inquilino' },
  { value: 'FAMILIAR', label: 'Familiar' },
  { value: 'OTRO', label: 'Otro' }
];

const USO_PREDIO_OPTIONS = [
  { value: 'VIVIENDA', label: 'Vivienda' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'MIXTO', label: 'Mixto' },
  { value: 'BALDIO', label: 'Baldío' },
  { value: 'OTROS', label: 'Otros' }
];

/**
 * Formulario de registro de predio con Material-UI
 */
const PredioForm: React.FC<PredioFormProps> = memo(({ codPersona }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hook para la API
  const { guardarPredio } = usePredioAPI(codPersona);

  // React Hook Form
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<PredioFormData>({
    defaultValues: {
      anioAdquisicion: new Date().getFullYear().toString(),
      fechaAdquisicion: null,
      condicionPropiedad: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      arancel: 0,
      tipoPredio: '',
      conductor: '',
      usoPredio: '',
      areaTerreno: 0,
      numeroPisos: 1,
      numeroCondominos: 0,
    }
  });

  // Generar años disponibles
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  // Observar valores del formulario
  const direccionSeleccionada = watch('direccion');

  // Manejar el envío del formulario
  const onSubmit = async (data: PredioFormData) => {
    setIsSubmitting(true);
    try {
      await guardarPredio(data);
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar la selección de dirección
  const handleDireccionSelect = useCallback((direccion: Direccion) => {
    setValue('direccion', direccion, { shouldDirty: true });
    setIsModalOpen(false);
    NotificationService.info('Dirección seleccionada correctamente');
  }, [setValue]);

  // Obtener texto de la dirección
  const getDireccionTexto = () => {
    if (!direccionSeleccionada) return '';
    return direccionSeleccionada.descripcion || 
           `${direccionSeleccionada.nombreCalle || ''} ${direccionSeleccionada.numeracion || ''}`.trim();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Sección: Datos del Predio */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Datos del Predio
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  {/* Año de Adquisición */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="anioAdquisicion"
                      control={control}
                      rules={{ required: 'El año es requerido' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.anioAdquisicion}>
                          <InputLabel>Año de Adquisición</InputLabel>
                          <Select
                            {...field}
                            label="Año de Adquisición"
                            startAdornment={
                              <InputAdornment position="start">
                                <CalendarIcon fontSize="small" />
                              </InputAdornment>
                            }
                          >
                            {yearOptions.map(year => (
                              <MenuItem key={year.value} value={year.value}>
                                {year.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.anioAdquisicion && (
                            <FormHelperText>{errors.anioAdquisicion.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Fecha de Adquisición */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="fechaAdquisicion"
                      control={control}
                      rules={{ required: 'La fecha es requerida' }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Fecha de Adquisición"
                          format="dd/MM/yyyy"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.fechaAdquisicion,
                              helperText: errors.fechaAdquisicion?.message,
                              placeholder: "dd/mm/aaaa",
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarIcon fontSize="small" />
                                  </InputAdornment>
                                )
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Condición de Propiedad */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="condicionPropiedad"
                      control={control}
                      rules={{ required: 'La condición es requerida' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.condicionPropiedad}>
                          <InputLabel>Condición de Propiedad</InputLabel>
                          <Select
                            {...field}
                            label="Condición de Propiedad"
                          >
                            <MenuItem value="">
                              <em>Seleccione condición</em>
                            </MenuItem>
                            {CONDICION_PROPIEDAD_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.condicionPropiedad && (
                            <FormHelperText>{errors.condicionPropiedad.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${CONDICION_PROPIEDAD_OPTIONS.length} opciones`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  {/* Dirección del Predio */}
                  <Grid item xs={12} md={8}>
                    <Controller
                      name="direccion"
                      control={control}
                      rules={{ required: 'La dirección es requerida' }}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label="Dirección del Predio"
                          value={getDireccionTexto()}
                          placeholder="Seleccione una dirección"
                          error={!!errors.direccion}
                          helperText={errors.direccion?.message}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => setIsModalOpen(true)}
                                  startIcon={<SearchIcon />}
                                  disabled={isSubmitting}
                                >
                                  Buscar
                                </Button>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* N° Finca */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="nFinca"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="N° Finca"
                          placeholder="Número de finca"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sección: Otros Datos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <DomainIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Otros Datos
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  {/* Tipo de Predio */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="tipoPredio"
                      control={control}
                      rules={{ required: 'El tipo es requerido' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.tipoPredio}>
                          <InputLabel>Tipo de Predio</InputLabel>
                          <Select
                            {...field}
                            label="Tipo de Predio"
                            startAdornment={
                              <InputAdornment position="start">
                                <ApartmentIcon fontSize="small" />
                              </InputAdornment>
                            }
                          >
                            <MenuItem value="">
                              <em>Seleccione tipo</em>
                            </MenuItem>
                            {TIPO_PREDIO_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.tipoPredio && (
                            <FormHelperText>{errors.tipoPredio.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${TIPO_PREDIO_OPTIONS.length} opciones`}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  {/* Conductor */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="conductor"
                      control={control}
                      rules={{ required: 'El conductor es requerido' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.conductor}>
                          <InputLabel>Conductor</InputLabel>
                          <Select
                            {...field}
                            label="Conductor"
                            startAdornment={
                              <InputAdornment position="start">
                                <GroupsIcon fontSize="small" />
                              </InputAdornment>
                            }
                          >
                            <MenuItem value="">
                              <em>Seleccione conductor</em>
                            </MenuItem>
                            {CONDUCTOR_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.conductor && (
                            <FormHelperText>{errors.conductor.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${CONDUCTOR_OPTIONS.length} opciones`}
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  {/* Uso del Predio */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="usoPredio"
                      control={control}
                      rules={{ required: 'El uso es requerido' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.usoPredio}>
                          <InputLabel>Uso del Predio</InputLabel>
                          <Select
                            {...field}
                            label="Uso del Predio"
                          >
                            <MenuItem value="">
                              <em>Seleccione uso</em>
                            </MenuItem>
                            {USO_PREDIO_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.usoPredio && (
                            <FormHelperText>{errors.usoPredio.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${USO_PREDIO_OPTIONS.length} opciones`}
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  {/* Área del Terreno */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="areaTerreno"
                      control={control}
                      rules={{ 
                        required: 'El área es requerida',
                        min: { value: 0.01, message: 'El área debe ser mayor a 0' }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Área del Terreno (m²)"
                          type="number"
                          error={!!errors.areaTerreno}
                          helperText={errors.areaTerreno?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TerrainIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            inputProps: { min: 0, step: 0.01 }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Número de Pisos */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="numeroPisos"
                      control={control}
                      rules={{ 
                        required: 'El número de pisos es requerido',
                        min: { value: 1, message: 'Debe haber al menos 1 piso' }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Número de Pisos"
                          type="number"
                          error={!!errors.numeroPisos}
                          helperText={errors.numeroPisos?.message}
                          InputProps={{
                            inputProps: { min: 0, max: 50 }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Número de Condóminos */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="numeroCondominos"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Número de Condóminos"
                          type="number"
                          InputProps={{
                            inputProps: { min: 0 }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Mensaje informativo si no hay contribuyente */}
          {!codPersona && (
            <Grid item xs={12}>
              <Alert severity="warning">
                Debe seleccionar un contribuyente antes de registrar un predio
              </Alert>
            </Grid>
          )}

          {/* Botones de Acción */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/predio/consulta')}
                startIcon={<CancelIcon />}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting || !codPersona}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Predio'}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Modal de selección de dirección */}
        <SelectorDirecciones
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectDireccion={handleDireccionSelect}
        />
      </Box>
    </LocalizationProvider>
  );
});

PredioForm.displayName = 'PredioForm';

export default PredioForm;