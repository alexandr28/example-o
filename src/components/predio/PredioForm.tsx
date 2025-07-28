// src/components/predio/PredioForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Componentes
import SearchableSelect from '../ui/SearchableSelect';
import SelectorDirecciones from '../modal/SelectorDirecciones';
import SelectorContribuyente from '../modal/SelectorContribuyente';

// Hooks
import { 
  useCondicionPropiedadOptions,
  useTipoPredioOptions,
  useConstantesOptions
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

interface Contribuyente {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica';
}

interface PredioFormProps {
  predioExistente?: PredioFormData;
  onSubmit?: (data: PredioFormData) => void;
  codPersona?: number;
}

// Schema de validación con Zod
const predioSchema = z.object({
  codPersona: z.number().optional(),
  anio: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  fechaAdquisicion: z.date().nullable().optional(),
  condicionPropiedad: z.string().min(1, 'La condición es requerida'),
  tipoPredio: z.string().optional(),
  conductor: z.string().min(1, 'El conductor es requerido'),
  usoPredio: z.string().optional(),
  estadoPredio: z.string().optional(),
  modoDeclaracion: z.string().optional(),
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
  codPersona
}) => {
  const theme = useTheme();
  const [showSelectorDirecciones, setShowSelectorDirecciones] = useState(false);
  const [showSelectorContribuyente, setShowSelectorContribuyente] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<Contribuyente | null>(null);

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
  
  // Para los demás campos, usar useConstantesOptions con funciones del servicio
  const { options: conductorData, loading: loadingConductor, error: errorConductor } = 
    useConstantesOptions(
      () => constanteService.obtenerTiposListaConductor()
    );
  
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

  // Cargar años desde la API usando el servicio de constantes
  const { options: aniosData, loading: loadingAnios, error: errorAnios } = 
    useConstantesOptions(
      () => constanteService.obtenerTiposAnio(),
      (data) => ({
        value: parseInt(data.codConstante),
        label: data.nombreCategoria,
        id: data.codConstante
      })
    );

  // Verificar si algún campo está cargando
  const isLoadingOptions = loadingCondicion || loadingTipoPredio || 
                          loadingConductor || loadingUsoPredio || 
                          loadingEstadoPredio || loadingModoDeclaracion || 
                          loadingAnios;

  // Verificar si hay errores en la carga
  const hasLoadingErrors = errorCondicion || errorTipoPredio || 
                          errorConductor || errorUsoPredio || 
                          errorEstadoPredio || errorModoDeclaracion ||
                          errorAnios;

  // Efecto para establecer el código del contribuyente
  useEffect(() => {
    if (codPersona) {
      setValue('codPersona', codPersona);
    }
  }, [codPersona, setValue]);

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

  // Manejar selección de contribuyente
  const handleSelectContribuyente = (contribuyente: Contribuyente) => {
    setContribuyenteSeleccionado(contribuyente);
    setValue('codPersona', contribuyente.codigo);
    setShowSelectorContribuyente(false);
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

          {/* Sección de Contribuyente */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Contribuyente Propietario
            </Typography>

            {!contribuyenteSeleccionado && !codPersona ? (
              // Estado inicial: sin contribuyente seleccionado
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: theme.palette.action.hover,
                  border: '2px dashed',
                  borderColor: theme.palette.divider
                }}
              >
                <SearchIcon
                  sx={{
                    fontSize: 60,
                    color: theme.palette.text.secondary,
                    mb: 2
                  }}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  No se ha seleccionado ningún contribuyente
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => setShowSelectorContribuyente(true)}
                  size="large"
                >
                  Seleccionar Contribuyente
                </Button>
              </Card>
            ) : (
              // Contribuyente seleccionado
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: contribuyenteSeleccionado?.tipoPersona === 'juridica' 
                          ? 'primary.main' 
                          : 'secondary.main'
                      }}
                    >
                      {contribuyenteSeleccionado?.tipoPersona === 'juridica' ? (
                        <BusinessIcon />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {contribuyenteSeleccionado?.contribuyente || 'Contribuyente'}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BadgeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {contribuyenteSeleccionado?.documento || '-'}
                          </Typography>
                        </Box>
                        
                        {contribuyenteSeleccionado?.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {contribuyenteSeleccionado.telefono}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {contribuyenteSeleccionado?.direccion || '-'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <IconButton
                      onClick={() => setShowSelectorContribuyente(true)}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.16)
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          <Divider />

          {/* Datos del predio - Solo visible si hay contribuyente */}
          {(contribuyenteSeleccionado || codPersona) && (
            <>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Datos del predio
              </Typography>

              <Grid container spacing={2}>
                {/* Primera fila */}
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'anio',
                    'Año',
                    aniosData || [],
                    loadingAnios,
                    null,
                    false,
                    'Seleccione año'
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <Controller
                      name="fechaAdquisicion"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Fecha de adquisición"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.fechaAdquisicion,
                              helperText: errors.fechaAdquisicion?.message
                            }
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'condicionPropiedad',
                    'Condición',
                    condicionData || [],
                    loadingCondicion,
                    errorCondicion,
                    true
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="numeroFinca"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="N° finca"
                        fullWidth
                        error={!!errors.numeroFinca}
                        helperText={errors.numeroFinca?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Segunda fila */}
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="otroNumero"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Otro número"
                        fullWidth
                        error={!!errors.otroNumero}
                        helperText={errors.otroNumero?.message}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="arancel"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Arancel"
                        fullWidth
                        error={!!errors.arancel}
                        helperText={errors.arancel?.message}
                      />
                    )}
                    disabled={true}
                  />
                </Grid>
                
                <Grid item xs={12} md={9} sm={12}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Button
                      variant="contained"
                      onClick={() => setShowSelectorDirecciones(true)}
                      startIcon={<LocationIcon />}
                      sx={{ 
                        minWidth: 'auto',
                        px: 2,
                        height: 56,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Seleccionar dirección
                    </Button>
                    <TextField
                      label="Dirección seleccionada"
                      value={watch('direccion')?.descripcion || ''}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                      error={!!errors.direccion}
                      helperText={errors.direccion?.message || (!watch('direccion') ? 'Seleccione una dirección' : '')}
                    />
                  </Stack>
                </Grid>

                {/* Tercera fila */}
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'tipoPredio',
                    'Tipo',
                    tipoPredioData || [],
                    loadingTipoPredio,
                    errorTipoPredio,
                    false
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'conductor',
                    'Conductor',
                    conductorData || [],
                    loadingConductor,
                    errorConductor,
                    true
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'usoPredio',
                    'Uso',
                    usoPredioData || [],
                    loadingUsoPredio,
                    errorUsoPredio,
                    false
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="areaTerreno"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Área de terreno"
                        type="number"
                        fullWidth
                        InputProps={{
                          endAdornment: <Typography variant="body2">m²</Typography>
                        }}
                        error={!!errors.areaTerreno}
                        helperText={errors.areaTerreno?.message}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                </Grid>

                {/* Cuarta fila */}
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="numeroPisos"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número de pisos"
                        type="number"
                        fullWidth
                        error={!!errors.numeroPisos}
                        helperText={errors.numeroPisos?.message}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="numeroCondominos"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="N° Condóminos"
                        type="number"
                        fullWidth
                        error={!!errors.numeroCondominos}
                        helperText={errors.numeroCondominos?.message}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'estadoPredio',
                    'Estado',
                    estadoPredioData || [],
                    loadingEstadoPredio,
                    errorEstadoPredio,
                    false
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderSearchableSelect(
                    'modoDeclaracion',
                    'Modo',
                    modoDeclaracionData || [],
                    loadingModoDeclaracion,
                    errorModoDeclaracion,
                    false
                  )}
                </Grid>
              </Grid>

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
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting || isLoadingOptions}
                  size="large"
                >
                  {isSubmitting ? 'Guardando...' : 'Registrar / Editar'}
                </Button>
              </Box>
            </>
          )}

          {/* Mostrar errores de carga */}
          {hasLoadingErrors && (
            <Alert severity="error">
              Error al cargar las opciones del formulario. Por favor, recargue la página.
            </Alert>
          )}
        </Stack>
      </form>

      {/* Modal de selección de dirección */}
      <SelectorDirecciones
        open={showSelectorDirecciones}
        onClose={() => setShowSelectorDirecciones(false)}
        onSelectDireccion={handleSelectDireccion}
      />

      {/* Modal de selección de contribuyente */}
      <SelectorContribuyente
        isOpen={showSelectorContribuyente}
        onClose={() => setShowSelectorContribuyente(false)}
        onSelectContribuyente={handleSelectContribuyente}
        selectedId={contribuyenteSeleccionado?.codigo}
      />
    </Paper>
  );
};

export default PredioForm;