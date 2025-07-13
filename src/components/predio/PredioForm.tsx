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
import { usePredios } from '../../hooks/usePredioAPI';
import { NotificationService } from '../utils/Notification';
import SelectorDirecciones from '../modal/SelectorDirecciones';
import { 
  CondicionPropiedad, 
  TipoPredio, 
  ConductorPredio, 
  UsoPredio,
  EstadoPredio,
  PredioFormData 
} from '../../models/Predio';

// Interfaces
interface Direccion {
  id: number;
  codDireccion?: number;
  descripcion: string;
  nombreCalle?: string;
  numeracion?: string;
}

interface PredioFormProps {
  codPersona?: number; // ID del contribuyente seleccionado
  predioExistente?: any; // Para edición
}

// Opciones para los selects con los valores de la nueva API
const CONDICION_PROPIEDAD_OPTIONS = [
  { value: CondicionPropiedad.PROPIETARIO_UNICO, label: 'Propietario Único' },
  { value: CondicionPropiedad.PROPIETARIO, label: 'Propietario' },
  { value: CondicionPropiedad.POSEEDOR, label: 'Poseedor' },
  { value: CondicionPropiedad.ARRENDATARIO, label: 'Arrendatario' },
  { value: CondicionPropiedad.USUFRUCTUARIO, label: 'Usufructuario' },
  { value: CondicionPropiedad.OTRO, label: 'Otro' }
];

const TIPO_PREDIO_OPTIONS = [
  { value: TipoPredio.PREDIO_INDEPENDIENTE, label: 'Predio Independiente' },
  { value: TipoPredio.DEPARTAMENTO_EDIFICIO, label: 'Departamento en Edificio' },
  { value: TipoPredio.PREDIO_QUINTA, label: 'Predio en Quinta' },
  { value: TipoPredio.CUARTO_CASA_VECINDAD, label: 'Cuarto en Casa Vecindad' },
  { value: TipoPredio.OTROS, label: 'Otros' }
];

const CONDUCTOR_OPTIONS = [
  { value: ConductorPredio.PRIVADO, label: 'Privado' },
  { value: ConductorPredio.PROPIETARIO, label: 'Propietario' },
  { value: ConductorPredio.INQUILINO, label: 'Inquilino' },
  { value: ConductorPredio.FAMILIAR, label: 'Familiar' },
  { value: ConductorPredio.OTRO, label: 'Otro' }
];

const USO_PREDIO_OPTIONS = [
  { value: UsoPredio.VIVIENDA, label: 'Vivienda' },
  { value: UsoPredio.COMERCIAL, label: 'Comercial' },
  { value: UsoPredio.INDUSTRIAL, label: 'Industrial' },
  { value: UsoPredio.SERVICIOS, label: 'Servicios' },
  { value: UsoPredio.MIXTO, label: 'Mixto' },
  { value: UsoPredio.BALDIO, label: 'Baldío' },
  { value: UsoPredio.OTROS, label: 'Otros' }
];

const ESTADO_PREDIO_OPTIONS = [
  { value: EstadoPredio.TERMINADO, label: 'Terminado' },
  { value: EstadoPredio.EN_CONSTRUCCION, label: 'En Construcción' },
  { value: EstadoPredio.EN_PROCESO, label: 'En Proceso' },
  { value: EstadoPredio.REGISTRADO, label: 'Registrado' },
  { value: EstadoPredio.OBSERVADO, label: 'Observado' },
  { value: EstadoPredio.ANULADO, label: 'Anulado' }
];

/**
 * Formulario de registro de predio con Material-UI
 */
const PredioForm: React.FC<PredioFormProps> = memo(({ codPersona, predioExistente }) => {
  const navigate = useNavigate();
  const { crearPredio, actualizarPredio } = usePredios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configurar formulario con valores por defecto o del predio existente
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PredioFormData>({
    defaultValues: {
      anio: predioExistente?.anio || new Date().getFullYear(),
      fechaAdquisicion: predioExistente?.fechaAdquisicion || null,
      condicionPropiedad: predioExistente?.condicionPropiedad || CondicionPropiedad.PROPIETARIO_UNICO,
      direccion: predioExistente?.direccion || null,
      numeroFinca: predioExistente?.numeroFinca || '',
      otroNumero: predioExistente?.otroNumero || '',
      areaTerreno: predioExistente?.areaTerreno || 0,
      tipoPredio: predioExistente?.tipoPredio || TipoPredio.PREDIO_INDEPENDIENTE,
      conductor: predioExistente?.conductor || ConductorPredio.PRIVADO,
      usoPredio: predioExistente?.usoPredio || UsoPredio.VIVIENDA,
      estadoPredio: predioExistente?.estadoPredio || EstadoPredio.TERMINADO,
      numeroPisos: predioExistente?.numeroPisos || 1,
      numeroCondominos: predioExistente?.numeroCondominos || 0,
      valorTerreno: predioExistente?.valorTerreno || 0,
      totalAreaConstruccion: predioExistente?.totalAreaConstruccion || 0,
      valorTotalConstruccion: predioExistente?.valorTotalConstruccion || 0,
      autoavaluo: predioExistente?.autoavaluo || 0
    }
  });

  const direccionSeleccionada = watch('direccion');

  // Manejar selección de dirección
  const handleDireccionSelect = useCallback((direccion: Direccion) => {
    setValue('direccion', direccion.descripcion);
    setValue('direccionId', direccion.id);
    setIsModalOpen(false);
  }, [setValue]);

  // Guardar predio
  const onSubmit = async (data: PredioFormData) => {
    if (!codPersona && !predioExistente) {
      NotificationService.error('Debe seleccionar un contribuyente');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      
      if (predioExistente) {
        // Actualizar predio existente
        result = await actualizarPredio(predioExistente.codigoPredio, data);
      } else {
        // Crear nuevo predio
        result = await crearPredio(data);
      }

      if (result) {
        NotificationService.success(
          predioExistente ? 'Predio actualizado exitosamente' : 'Predio registrado exitosamente'
        );
        navigate('/predio/consulta');
      }
    } catch (error) {
      console.error('Error al guardar predio:', error);
      NotificationService.error('Error al guardar el predio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Sección: Datos de Adquisición */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6">Datos de Adquisición</Typography>
                </Stack>
                
                <Grid container spacing={2}>
                  {/* Año de Adquisición */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="anio"
                      control={control}
                      rules={{ required: 'Año es requerido' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Año"
                          type="number"
                          error={!!errors.anio}
                          helperText={errors.anio?.message}
                          InputProps={{
                            inputProps: { 
                              min: 1900, 
                              max: new Date().getFullYear() 
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Fecha de Adquisición */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="fechaAdquisicion"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Fecha de Adquisición"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.fechaAdquisicion,
                              helperText: errors.fechaAdquisicion?.message
                            }
                          }}
                          maxDate={new Date()}
                        />
                      )}
                    />
                  </Grid>

                  {/* Condición de Propiedad */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="condicionPropiedad"
                      control={control}
                      rules={{ required: 'Condición es requerida' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.condicionPropiedad}>
                          <InputLabel>Condición de Propiedad</InputLabel>
                          <Select {...field} label="Condición de Propiedad">
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
                  </Grid>

                  {/* Estado del Predio */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="estadoPredio"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Estado del Predio</InputLabel>
                          <Select {...field} label="Estado del Predio">
                            {ESTADO_PREDIO_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sección: Ubicación */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <LocationIcon color="primary" />
                  <Typography variant="h6">Ubicación</Typography>
                </Stack>
                
                <Grid container spacing={2}>
                  {/* Dirección */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="direccion"
                      control={control}
                      rules={{ required: 'Dirección es requerida' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Dirección"
                          error={!!errors.direccion}
                          helperText={errors.direccion?.message}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <Button
                                  size="small"
                                  startIcon={<SearchIcon />}
                                  onClick={() => setIsModalOpen(true)}
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

                  {/* Número de Finca */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="numeroFinca"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="N° Finca"
                        />
                      )}
                    />
                  </Grid>

                  {/* Otro Número */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="otroNumero"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Otro Número"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sección: Características del Predio */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <DomainIcon color="primary" />
                  <Typography variant="h6">Características del Predio</Typography>
                </Stack>
                
                <Grid container spacing={2}>
                  {/* Tipo de Predio */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="tipoPredio"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Tipo de Predio</InputLabel>
                          <Select {...field} label="Tipo de Predio">
                            {TIPO_PREDIO_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Conductor */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="conductor"
                      control={control}
                      rules={{ required: 'Conductor es requerido' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.conductor}>
                          <InputLabel>Conductor</InputLabel>
                          <Select {...field} label="Conductor">
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
                  </Grid>

                  {/* Uso del Predio */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="usoPredio"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Uso del Predio</InputLabel>
                          <Select {...field} label="Uso del Predio">
                            {USO_PREDIO_OPTIONS.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Área del Terreno */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="areaTerreno"
                      control={control}
                      rules={{ 
                        required: 'Área es requerida',
                        min: { value: 0.01, message: 'Área debe ser mayor a 0' }
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
                            startAdornment: <InputAdornment position="start">
                              <TerrainIcon fontSize="small" />
                            </InputAdornment>,
                            inputProps: { min: 0, step: 0.01 }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sección: Datos Adicionales */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <ApartmentIcon color="primary" />
                  <Typography variant="h6">Datos Adicionales</Typography>
                </Stack>
                
                <Grid container spacing={2}>
                  {/* Número de Pisos */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="numeroPisos"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Número de Pisos"
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, max: 50 }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Número de Condóminos */}
                  <Grid item xs={12} md={3}>
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

                  {/* Área Construida */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="totalAreaConstruccion"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Área Construida (m²)"
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, step: 0.01 }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Valor del Terreno */}
                  <Grid item xs={12} md={3}>
                    <Controller
                      name="valorTerreno"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Valor del Terreno"
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                            inputProps: { min: 0, step: 0.01 }
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
          {!codPersona && !predioExistente && (
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
                disabled={isSubmitting || (!codPersona && !predioExistente)}
              >
                {isSubmitting ? 'Guardando...' : predioExistente ? 'Actualizar Predio' : 'Guardar Predio'}
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