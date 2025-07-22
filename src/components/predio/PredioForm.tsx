// src/components/predio/PredioForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Skeleton,
  FormHelperText,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Home as HomeIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import SearchableSelect from '../ui/SearchableSelect';
import { 
  useCondicionPropiedadOptions,
  useTipoPredioOptions,
  useConstantesOptions
} from '../../hooks/useConstantesOptions';
import { ConstanteService } from '../../services/constanteService';
import constanteService from '../../services/constanteService';
import SelectorDirecciones from '../modal/SelectorDirecciones';

interface PredioFormData {
  // Datos del predio
  anio: number;
  fechaAdquisicion: Date | null;
  condicionPropiedad: string;
  nroFinca: string;
  otroNumero: string;
  arancel: string;
  
  // Características del predio
  tipoPredio: string;
  conductor: string;
  usoPredio: string;
  
  // Área del terreno
  areaTerreno: number;
  
  // Número de pisos y condominios
  numeroPisos: number;
  nroCondominios: number;
  
  // Dirección
  direccion: any;
  direccionId?: number;
  
  // Estado y declaración
  estadoPredio: string;
  modoDeclaracion: string;
  
  // Código contribuyente
  codigoContribuyente?: number;
  
  // Archivos
  imagenes?: File[];
}

interface PredioFormProps {
  codPersona?: number;
  predioExistente?: any;
  onSubmit?: (data: PredioFormData) => void;
  onCancel?: () => void;
}

const PredioForm: React.FC<PredioFormProps> = ({
  codPersona,
  predioExistente,
  onSubmit,
  onCancel
}) => {
  const currentYear = new Date().getFullYear();
  const [showSelectorDirecciones, setShowSelectorDirecciones] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PredioFormData>({
    defaultValues: {
      anio: predioExistente?.anio || currentYear,
      fechaAdquisicion: predioExistente?.fechaAdquisicion || null,
      condicionPropiedad: predioExistente?.condicionPropiedad || '',
      nroFinca: predioExistente?.nroFinca || '',
      otroNumero: predioExistente?.otroNumero || '',
      arancel: predioExistente?.arancel || '',
      tipoPredio: predioExistente?.tipoPredio || '',
      conductor: predioExistente?.conductor || '',
      usoPredio: predioExistente?.usoPredio || '',
      areaTerreno: predioExistente?.areaTerreno || 0,
      numeroPisos: predioExistente?.numeroPisos || 0,
      nroCondominios: predioExistente?.nroCondominios || 0,
      direccion: predioExistente?.direccion || null,
      estadoPredio: predioExistente?.estadoPredio || '',
      modoDeclaracion: predioExistente?.modoDeclaracion || '',
      codigoContribuyente: codPersona
    }
  });

  const direccionSeleccionada = watch('direccion');
  const nroFinca = watch('nroFinca');
  const otroNumero = watch('otroNumero');

  // Construir la dirección completa con N° finca y Otro número
  const direccionCompleta = React.useMemo(() => {
    if (!direccionSeleccionada) return '';
    
    let direccion = `${direccionSeleccionada.nombreVia || ''} ${direccionSeleccionada.cuadra || ''} - ${direccionSeleccionada.descripcion || ''}`;
    
    // Agregar N° finca si existe
    if (nroFinca && nroFinca.trim()) {
      direccion += ` - N° Finca: ${nroFinca}`;
    }
    
    // Agregar Otro número si existe
    if (otroNumero && otroNumero.trim()) {
      direccion += ` - Otro N°: ${otroNumero}`;
    }
    
    return direccion.trim();
  }, [direccionSeleccionada, nroFinca, otroNumero]);

  // Cargar opciones usando hooks personalizados
  const { 
    options: condicionPropiedadOptions, 
    loading: loadingCondicion,
    error: errorCondicion 
  } = useCondicionPropiedadOptions();

  const { 
    options: tipoPredioOptions, 
    loading: loadingTipoPredio,
    error: errorTipoPredio 
  } = useTipoPredioOptions();

  const { 
    options: conductorOptions, 
    loading: loadingConductor,
    error: errorConductor 
  } = useConstantesOptions(
    () => constanteService.obtenerTiposListaConductor()
  );

  const { 
    options: usoPredioOptions, 
    loading: loadingUsoPredio,
    error: errorUsoPredio 
  } = useConstantesOptions(
    () => constanteService.obtenerTiposListaUsos()
  );

  const { 
    options: estadoPredioOptions, 
    loading: loadingEstadoPredio,
    error: errorEstadoPredio 
  } = useConstantesOptions(
    () => constanteService.obtenerTiposEstadoPredio()
  );

  const { 
    options: modoDeclaracionOptions, 
    loading: loadingModoDeclaracion,
    error: errorModoDeclaracion 
  } = useConstantesOptions(
    () => constanteService.obtenerTiposModoDeclaracion()
  );

  // Cargar años desde la API
  const { 
    options: anioOptions, 
    loading: loadingAnios,
    error: errorAnios 
  } = useConstantesOptions(
    () => constanteService.obtenerTiposAnio(),
    (data) => ({
      value: parseInt(data.codConstante),
      label: data.nombreCategoria,
      id: data.codConstante
    }),
    // Valores por defecto mientras carga
    Array.from({ length: 10 }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString(),
      id: (currentYear - i).toString()
    }))
  );

  // Verificar si algún campo está cargando
  const isLoadingOptions = loadingCondicion || loadingTipoPredio || 
                          loadingConductor || loadingUsoPredio || 
                          loadingEstadoPredio || loadingModoDeclaracion || 
                          loadingAnios;

  // Verificar si hay errores en la carga
  const hasLoadingErrors = errorCondicion || errorTipoPredio || 
                          errorConductor || errorUsoPredio || 
                          errorEstadoPredio || errorModoDeclaracion;

  const onFormSubmit = (data: PredioFormData) => {
    console.log('Datos del formulario:', data);
    if (onSubmit) {
      onSubmit({
        ...data,
        imagenes: selectedImages
      });
    }
  };

  // Manejar selección de dirección
  const handleSelectDireccion = (direccion: any) => {
    setValue('direccion', direccion);
    setValue('direccionId', direccion.id);
    setShowSelectorDirecciones(false);
  };

  // Manejar carga de imágenes
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages(prev => [...prev, ...fileArray]);
    }
  };

  // Función helper para renderizar un SearchableSelect con loading
  const renderSearchableSelect = (
    name: keyof PredioFormData,
    label: string,
    options: any[],
    loading: boolean,
    error: string | null,
    required: boolean = true,
    placeholder?: string
  ) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label} es requerido` : false }}
        render={({ field }) => (
          <SearchableSelect
            {...field}
            label={label}
            options={options}
            loading={loading}
            error={!!errors[name] || !!error}
            helperText={errors[name]?.message || error}
            fullWidth
            placeholder={placeholder || `Seleccione ${label.toLowerCase()}`}
          />
        )}
      />
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon color="primary" />
            <Typography variant="h6" component="h2">
              {predioExistente ? 'Editar Predio' : 'Registrar Nuevo Predio'}
            </Typography>
          </Box>

          {/* Mostrar alerta si hay errores de carga */}
          {hasLoadingErrors && (
            <Alert severity="warning" icon={<WarningIcon />}>
              Algunas opciones no pudieron cargarse correctamente. 
              Se están usando valores por defecto.
            </Alert>
          )}

          {/* Información del contribuyente */}
          {codPersona && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Código Contribuyente:</strong> {codPersona}
              </Typography>
            </Alert>
          )}

          {/* Sección: Datos del predio */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Datos del predio
            </Typography>
            
            {/* Primera fila */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <Controller
                  name="anio"
                  control={control}
                  rules={{ required: 'Año es requerido' }}
                  render={({ field }) => (
                    <SearchableSelect
                      {...field}
                      label="Año"
                      options={anioOptions}
                      loading={loadingAnios}
                      error={!!errors.anio || !!errorAnios}
                      helperText={errors.anio?.message || errorAnios}
                      fullWidth
                      placeholder="Seleccione año"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <Controller
                    name="fechaAdquisicion"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha de adquisición"
                        value={field.value}
                        onChange={field.onChange}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.fechaAdquisicion,
                            helperText: errors.fechaAdquisicion?.message,
                            size: "medium"
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="condicionPropiedad"
                  control={control}
                  rules={{ required: 'Condición de propiedad es requerida' }}
                  render={({ field }) => (
                    <SearchableSelect
                      {...field}
                      label="Condición propiedad"
                      options={condicionPropiedadOptions}
                      loading={loadingCondicion}
                      error={!!errors.condicionPropiedad || !!errorCondicion}
                      helperText={errors.condicionPropiedad?.message || errorCondicion}
                      fullWidth
                      placeholder="Seleccione condición"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="nroFinca"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="N° finca"
                      size="medium"
                      error={!!errors.nroFinca}
                      helperText={errors.nroFinca?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="otroNumero"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Otro número"
                      size="medium"
                      error={!!errors.otroNumero}
                      helperText={errors.otroNumero?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Segunda fila: Arancel, Botón seleccionar dirección, Dirección seleccionada */}
            {/* Segunda fila: Arancel, Botón seleccionar dirección, Dirección seleccionada */}
<Grid container spacing={2} sx={{ mt: 1 }}>
  <Grid item xs={12} md={2}>
    <Controller
      name="arancel"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label="Arancel"
          type="number"
          size="medium"
          error={!!errors.arancel}
          helperText={errors.arancel?.message}
        />
      )}
    />
  </Grid>

  <Grid item xs={12} md={2}>
    <Button
      variant="outlined"
      fullWidth
      startIcon={<LocationIcon />}
      onClick={() => setShowSelectorDirecciones(true)}
      sx={{ height: '56px' }}
    >
      Seleccionar dirección
    </Button>
  </Grid>

  <Grid item xs={12} md={8}>
    <TextField
      fullWidth
      label="Dirección seleccionada"
      value={direccionCompleta}
      disabled
      size="medium"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LocationIcon />
          </InputAdornment>
        )
      }}
      sx={{ 
        width: '100%',
        '& .MuiInputBase-root': {
          width: '100%'
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
          color: 'rgba(0, 0, 0, 0.87)'
        }
      }}
    />
  </Grid>
</Grid>

            {/* Tercera fila: Tipo predio, Conductor, Uso predio */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                {renderSearchableSelect(
                  'tipoPredio',
                  'Tipo predio',
                  tipoPredioOptions,
                  loadingTipoPredio,
                  errorTipoPredio,
                  true,
                  'Seleccione tipo'
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                {renderSearchableSelect(
                  'conductor',
                  'Conductor',
                  conductorOptions,
                  loadingConductor,
                  errorConductor,
                  true,
                  'Seleccione conductor'
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                {renderSearchableSelect(
                  'usoPredio',
                  'Usos de predio',
                  usoPredioOptions,
                  loadingUsoPredio,
                  errorUsoPredio,
                  true,
                  'Seleccione uso'
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="areaTerreno"
                  control={control}
                  rules={{ 
                    required: 'Área del terreno es requerida',
                    min: { value: 0, message: 'El área debe ser mayor a 0' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Área de terreno"
                      type="number"
                      size="medium"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m²</InputAdornment>
                      }}
                      error={!!errors.areaTerreno}
                      helperText={errors.areaTerreno?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="numeroPisos"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Número de pisos"
                      type="number"
                      size="medium"
                      error={!!errors.numeroPisos}
                      helperText={errors.numeroPisos?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Cuarta fila: Área de terreno y Número de pisos */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              
            </Grid>

            {/* Quinta fila: N° Condominios, Estado del Predio, Modo de Declaración */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="nroCondominios"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="N° Condominios"
                      type="number"
                      size="medium"
                      error={!!errors.nroCondominios}
                      helperText={errors.nroCondominios?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                {renderSearchableSelect(
                  'estadoPredio',
                  'Estado del Predio',
                  estadoPredioOptions,
                  loadingEstadoPredio,
                  errorEstadoPredio,
                  true,
                  'Seleccione estado'
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                {renderSearchableSelect(
                  'modoDeclaracion',
                  'Modo de Declaración',
                  modoDeclaracionOptions,
                  loadingModoDeclaracion,
                  errorModoDeclaracion,
                  true,
                  'Seleccione modo'
                )}
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Sección: Imágenes (mantener como está) */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Imágenes
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Seleccionar archivo
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Grid>
              
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  label="Ruta de fotografía del predio"
                  placeholder="Se mostrará la ruta de las imágenes seleccionadas"
                  value={selectedImages.map(f => f.name).join(', ')}
                  disabled
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
              </Grid>
              
              {selectedImages.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info" onClose={() => setSelectedImages([])}>
                    {selectedImages.length} imagen(es) seleccionada(s)
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            {onCancel && (
              <Button 
                variant="outlined" 
                onClick={onCancel}
                disabled={isSubmitting}
                size="large"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={isSubmitting || isLoadingOptions}
              size="large"
              sx={{ minWidth: 200 }}
            >
              {isSubmitting ? 'Guardando...' : 'Registrar / editar'}
            </Button>
          </Box>
        </Stack>
      </form>

      {/* Modal de selección de dirección */}
      <SelectorDirecciones
        open={showSelectorDirecciones}
        onClose={() => setShowSelectorDirecciones(false)}
        onSelectDireccion={handleSelectDireccion}
        direccionSeleccionada={direccionSeleccionada}
      />
    </Paper>
  );
};

export default PredioForm;