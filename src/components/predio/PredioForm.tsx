// src/components/predio/PredioForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Componentes
import SelectorDireccionArancel from '../modal/SelectorDireccionArancel';

// Types
import { ArancelData } from '../../services/arancelService';

// Hooks
import { 
  useCondicionPropiedadOptions,
  useTipoPredioOptions,
  useConstantesOptions,
  useClasificacionPredio,
  useListaConductorOptions
} from '../../hooks/useConstantesOptions';

// Services
import constanteService from '../../services/constanteService';

// Tipos
interface PredioFormData {
  // Contribuyente
  codPersona?: number;
  
  // Datos básicos
  anio?: number;
  fechaAdquisicion?: Date | null;
  condicionPropiedad: string;
  tipoPredio?: string;
  conductor: string;
  usoPredio?: string;
  estadoPredio?: string;
  modoDeclaracion?: string;
  clasificacionPredio?: string;
  
  // Ubicación
  direccionId?: number;
  direccion?: any;
  numeroFinca?: string;
  otroNumero?: string;
  arancel?: string;
  
  // Valores
  areaTerreno: number;
  numeroPisos?: number;
  numeroCondominos?: number;
  
  // Imágenes
  imagenes?: File[];
}

interface PredioFormProps {
  predioExistente?: PredioFormData;
  onSubmit?: (data: PredioFormData) => void;
  codPersona?: number;
  loading?: boolean;
}

// Schema de validación con Zod
const predioSchema = z.object({
  codPersona: z.number().optional(),
  anio: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  fechaAdquisicion: z.date().nullable().optional(),
  condicionPropiedad: z.string().min(1, 'La condición es requerida'),
  tipoPredio: z.string().optional(),
  conductor: z.string().min(1, 'El conductor es requerido'),
  usoPredio: z.string().optional(),
  estadoPredio: z.string().optional(),
  modoDeclaracion: z.string().optional(),
  clasificacionPredio: z.string().optional(),
  direccionId: z.number().optional(),
  direccion: z.any().optional(),
  numeroFinca: z.string().optional(),
  otroNumero: z.string().optional(),
  arancel: z.string().optional(),
  areaTerreno: z.number().min(0, 'El área debe ser mayor a 0'),
  numeroPisos: z.number().min(0).optional(),
  numeroCondominos: z.number().min(0).optional()
});

const PredioForm: React.FC<PredioFormProps> = ({
  predioExistente,
  onSubmit,
  codPersona,
  loading = false
}) => {
  const theme = useTheme();
  const [showSelectorDireccionArancel, setShowSelectorDireccionArancel] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PredioFormData>({
    resolver: zodResolver(predioSchema),
    defaultValues: {
      codPersona: codPersona,
      anio: new Date().getFullYear(),
      fechaAdquisicion: null,
      condicionPropiedad: '',
      tipoPredio: '',
      conductor: '',
      usoPredio: '',
      estadoPredio: '',
      modoDeclaracion: '',
      clasificacionPredio: '',
      direccion: null,
      numeroFinca: '',
      otroNumero: '',
      arancel: '',
      areaTerreno: 0,
      numeroPisos: 0,
      numeroCondominos: 0,
      ...predioExistente
    }
  });

  // Cargar datos usando los hooks correctos
  const { options: condicionData, loading: loadingCondicion, error: errorCondicion } = 
    useCondicionPropiedadOptions();
  
  const { options: tipoPredioData, loading: loadingTipoPredio, error: errorTipoPredio } = 
    useTipoPredioOptions();
  
  // Hook específico para lista de conductores
  const { options: conductorData, loading: loadingConductor, error: errorConductor } = 
    useListaConductorOptions();
  
  // Para los demás campos, usar useConstantesOptions con funciones del servicio
  
  const { options: usoPredioData, loading: loadingUsoPredio, error: errorUsoPredio } = 
    useConstantesOptions(
      () => constanteService.obtenerTiposListaUsos()
    );
  
  const { options: estadoPredioData, loading: loadingEstadoPredio, error: errorEstadoPredio } = 
    useConstantesOptions(
      () => constanteService.obtenerTiposEstadoPredio()
    );
  
  const { options: modoDeclaracionData, loading: loadingModoDeclaracion, error: errorModoDeclaracion } = 
    useConstantesOptions(
      () => constanteService.obtenerTiposModoDeclaracion()
    );
  
  const { options: clasificacionPredioData, loading: loadingClasificacionPredio, error: errorClasificacionPredio } = 
    useClasificacionPredio();
  
   
 

  // Cargar años desde la API usando el servicio de constantes
  const { options: aniosData, loading: loadingAnios, error: errorAnios } = 
    useConstantesOptions(
      () => constanteService.obtenerTiposAnio(),
      (data) => {
        // El año real está en nombreCategoria, no en codConstante
        let anio = parseInt(data.nombreCategoria);
        const currentYear = new Date().getFullYear();
        
        // Si el año está fuera del rango válido, usar año actual
        if (isNaN(anio) || anio < 1900 || anio > currentYear + 10) {
          console.warn(`⚠️ [PredioForm] Año inválido detectado en nombreCategoria: ${data.nombreCategoria}, codConstante: ${data.codConstante}, usando año actual: ${currentYear}`);
          anio = currentYear;
        }
        
        console.log(`✅ [PredioForm] Año válido procesado: ${anio} (codConstante: ${data.codConstante}, nombreCategoria: ${data.nombreCategoria})`);
        
        return {
          value: anio,
          label: anio.toString(),
          id: data.codConstante
        };
      }
    );

  // Crear años de fallback en caso de que la API falle
  const fallbackAnios = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 5; i++) {
      const year = currentYear + i;
      years.push({
        value: year,
        label: year.toString(),
        id: year.toString()
      });
    }
    return years;
  }, []);

  // Usar años de la API si están disponibles, sino usar fallback
  const aniosFinales = React.useMemo(() => {
    if (aniosData && aniosData.length > 0) {
      return aniosData;
    }
    console.log('📅 [PredioForm] Usando años de fallback:', fallbackAnios);
    return fallbackAnios;
  }, [aniosData, fallbackAnios]);

  // Verificar si algún campo está cargando
  const isLoadingOptions = loadingCondicion || loadingTipoPredio || 
                          loadingConductor || loadingUsoPredio || 
                          loadingEstadoPredio || loadingModoDeclaracion || 
                          loadingAnios || loadingClasificacionPredio;

  // Verificar si hay errores en la carga
  const hasLoadingErrors = errorCondicion || errorTipoPredio || 
                          errorConductor || errorUsoPredio || 
                          errorEstadoPredio || errorModoDeclaracion ||
                          errorAnios || errorClasificacionPredio;

  // Efecto para establecer el código del contribuyente
  useEffect(() => {
    if (codPersona) {
      setValue('codPersona', codPersona);
    }
  }, [codPersona, setValue]);

  // Observar cambios en los campos de dirección
  const direccionValue = watch('direccion');
  const numeroFincaValue = watch('numeroFinca');
  const otroNumeroValue = watch('otroNumero');

  // Efecto para actualizar la descripción de dirección cuando cambian N° Finca u Otro Número
  useEffect(() => {
    if (direccionValue && (direccionValue.anio && direccionValue.codigo)) {
      const nuevaDescripcion = buildDireccionCompleta(
        direccionValue,
        numeroFincaValue,
        otroNumeroValue
      );
      
      // Solo actualizar si la descripción ha cambiado
      if (direccionValue.descripcion !== nuevaDescripcion) {
        setValue('direccion', {
          ...direccionValue,
          descripcion: nuevaDescripcion
        });
      }
    }
  }, [numeroFincaValue, otroNumeroValue, direccionValue, setValue]);

  const onFormSubmit = (data: PredioFormData) => {
    console.log('Datos del formulario:', data);
    if (onSubmit) {
      onSubmit({
        ...data,
        imagenes: selectedImages
      });
    }
  };

  // Función para construir la descripción completa de la dirección
  const buildDireccionCompleta = (direccion: any, numeroFinca?: string, otroNumero?: string) => {
    if (!direccion) return '';
    
    let descripcion = `Año: ${direccion.anio} - Código Dirección: ${direccion.codigo}`;
    
    // Agregar N° Finca si existe
    if (numeroFinca && numeroFinca.trim()) {
      descripcion += ` - N° Finca: ${numeroFinca.trim()}`;
    }
    
    // Agregar Otro Número si existe (opcional)
    if (otroNumero && otroNumero.trim()) {
      descripcion += ` - Otro N°: ${otroNumero.trim()}`;
    }
    
    return descripcion;
  };

  // Manejar selección de arancel
  const handleSelectArancel = (arancel: ArancelData) => {
    console.log('🎯 [PredioForm] Arancel seleccionado:', arancel);
    
    // Crear un objeto con los datos de dirección y arancel
    const direccionData = {
      id: arancel.codDireccion,
      codigo: arancel.codDireccion,
      anio: arancel.anio,
      descripcion: buildDireccionCompleta(
        { anio: arancel.anio, codigo: arancel.codDireccion },
        numeroFincaValue,
        otroNumeroValue
      ),
      arancel: arancel.costoArancel
    };
    
    // Establecer los valores en el formulario
    setValue('direccion', direccionData);
    setValue('direccionId', arancel.codDireccion);
    setValue('arancel', arancel.costoArancel.toString());
    
    setShowSelectorDireccionArancel(false);
  };


  // Manejar carga de imágenes
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages(prev => [...prev, ...fileArray]);
    }
  };

  // Función helper para renderizar un Autocomplete con loading
  const renderAutocomplete = (
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
          <Autocomplete
            {...field}
            options={options}
            getOptionLabel={(option) => option?.label || ''}
            value={options.find(opt => opt.value === field.value) || null}
            onChange={(_, newValue) => field.onChange(newValue?.value || '')}
            disabled={loading}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder || `Seleccione ${label.toLowerCase()}`}
                required={required}
                error={!!errors[name] || !!error}
                helperText={String(errors[name]?.message || '') || error}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
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

          {/* Datos del predio */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Datos del predio
              </Typography>

              <Stack spacing={2}>
                {/* Primera fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '0 0 100px' }}>
                    {renderAutocomplete(
                      'anio',
                      'Año',
                      aniosFinales,
                      loadingAnios,
                      errorAnios,
                      false,
                      'Seleccione año'
                    )}
                  </Box>
                  
                  <Box sx={{ flex: '0 0 140px', maxWidth:'140px' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                      <Controller
                        name="fechaAdquisicion"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="Fecha adquisición"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error: !!errors.fechaAdquisicion,
                                helperText: errors.fechaAdquisicion?.message
                              }
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'modoDeclaracion',
                      'ModoDeclaracion',
                      modoDeclaracionData || [],
                      loadingModoDeclaracion,
                      errorModoDeclaracion,
                      false
                    )}
                  </Box>
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'condicionPropiedad',
                      'CondicionPropiedad',
                      condicionData || [],
                      loadingCondicion,
                      errorCondicion,
                      true
                    )}
                  </Box>
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'tipoPredio',
                      'Tipo Predio',
                      tipoPredioData || [],
                      loadingTipoPredio,
                      errorTipoPredio,
                      false
                    )}
                  </Box>
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'usoPredio',
                      'Usos Predio',
                      usoPredioData || [],
                      loadingUsoPredio,
                      errorUsoPredio,
                      false
                    )}
                  </Box>
                  
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'clasificacionPredio',
                      'Clasificación Predio',
                      clasificacionPredioData || [],
                      loadingClasificacionPredio,
                      errorClasificacionPredio,
                      false
                    )}
                  </Box>
                  
                </Box>

                {/* Segunda fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  
                  
                  <Box sx={{ flex: '0 0 820px' }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Button
                        variant="contained"
                        onClick={() => setShowSelectorDireccionArancel(true)}
                        startIcon={<LocationIcon />}
                        size="small"
                        sx={{ 
                          minWidth: 'auto',
                          px: 2,
                          height: 40,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Buscar dirección
                      </Button>
                      <TextField
                        label="Dirección seleccionada"
                        value={direccionValue?.descripcion || ''}
                        fullWidth
                        size="small"
                        inputProps={{
                          readOnly: true
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon color="action" />
                            </InputAdornment>
                          )
                        }}
                        error={!!errors.direccion}
                        helperText={String(errors.direccion?.message || '') || (!direccionValue ? 'Seleccione una dirección' : '')}
                      />
                    </Stack>
                  </Box>
                  <Box sx={{ flex: '0 0 70px' }}>
                    <Controller
                      name="numeroFinca"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="N° finca"
                          fullWidth
                          size="small"
                          error={!!errors.numeroFinca}
                          helperText={errors.numeroFinca?.message}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 65px' }}>
                    <Controller
                      name="otroNumero"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Otro N°"
                          fullWidth
                          size="small"
                          error={!!errors.otroNumero}
                          helperText={errors.otroNumero?.message}
                        />
                      )}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '0 0 70px' }}>
                    <Controller
                      name="arancel"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Arancel"
                          fullWidth
                          size="small"
                          disabled={true}
                          InputProps={{
                            readOnly: true
                          }}
                          error={!!errors.arancel}
                          helperText={errors.arancel?.message}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Tercera fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'estadoPredio',
                      'EstadoPredio',
                      estadoPredioData || [],
                      loadingEstadoPredio,
                      errorEstadoPredio,
                      false
                    )}
                  </Box>
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'conductor',
                      'Conductor',
                      conductorData || [],
                      loadingConductor,
                      errorConductor,
                      true
                    )}
                  </Box>
                  <Box sx={{ flex: '0 0 80px' }}>
                    <Controller
                      name="areaTerreno"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Área m2"
                          type="number"
                          fullWidth
                          size="small"
                        
                          error={!!errors.areaTerreno}
                          helperText={errors.areaTerreno?.message}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 80px' }}>
                    <Controller
                      name="numeroPisos"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="N° Pisos"
                          type="number"
                          fullWidth
                          size="small"
                          error={!!errors.numeroPisos}
                          helperText={errors.numeroPisos?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 85px' }}>
                    <Controller
                      name="numeroCondominos"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="N° Condóminos"
                          type="number"
                          fullWidth
                          size="small"
                          error={!!errors.numeroCondominos}
                          helperText={errors.numeroCondominos?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Cuarta fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
               
                </Box>

                {/* Quinta fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                 
                </Box>
              </Stack>

              <Divider />

              {/* Sección de imágenes */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Imágenes
                </Typography>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoIcon />}
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
                  
                  <Typography variant="body2" color="text.secondary">
                    Se mostrará la ruta de las imágenes
                  </Typography>
                </Stack>
                
                {selectedImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedImages.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setSelectedImages(prev => 
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Botón de envío */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={isSubmitting || isLoadingOptions || loading}
                  size="large"
                >
                  {loading ? 'Registrando...' : (isSubmitting ? 'Guardando...' : (predioExistente ? 'Guardar' : 'Registrar'))}
                </Button>
              </Box>

          {/* Mostrar errores de carga */}
          {hasLoadingErrors && (
            <Alert severity="error">
              Error al cargar las opciones del formulario. Por favor, recargue la página.
            </Alert>
          )}
        </Stack>
      </form>

      {/* Modal de selección de dirección con arancel */}
      <SelectorDireccionArancel
        open={showSelectorDireccionArancel}
        onClose={() => setShowSelectorDireccionArancel(false)}
        onSelectArancel={handleSelectArancel}
        title="Seleccionar Dirección con Arancel"
      />

    </Paper>
  );
};

export default PredioForm;