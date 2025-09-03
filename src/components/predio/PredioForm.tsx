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
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
  Autocomplete
} from '@mui/material';
import { predioService, CreatePredioDTO } from '../../services/predioService';
import { NotificationService } from '../utils/Notification';
import uploadService from '../../services/uploadService';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

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
  useListaConductorOptions,
  useGrupoUsoOptions
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
  criterioUso?: string;
  
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
  criterioUso: z.string().optional(),
  direccionId: z.number().optional(),
  direccion: z.any().optional(),
  numeroFinca: z.string().optional(),
  otroNumero: z.string().optional(),
  arancel: z.string().optional(),
  areaTerreno: z.number().min(0, 'El área no puede ser negativa'),
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
  const navigate = useNavigate();
  const [showSelectorDireccionArancel, setShowSelectorDireccionArancel] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      criterioUso: '',
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
  
  // Hook para criterio uso (grupo uso)
  const { options: criterioUsoData, loading: loadingCriterioUso, error: errorCriterioUso } = 
    useGrupoUsoOptions();
  
   
 

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
  React.useMemo(() => {
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
                          loadingAnios || loadingClasificacionPredio || loadingCriterioUso;

  // Verificar si hay errores en la carga
  const hasLoadingErrors = errorCondicion || errorTipoPredio || 
                          errorConductor || errorUsoPredio || 
                          errorEstadoPredio || errorModoDeclaracion ||
                          errorAnios || errorClasificacionPredio || errorCriterioUso;

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

  const onFormSubmit = async (data: PredioFormData) => {
    console.log('Datos del formulario:', data);
    
    try {
      // Preparar datos según la estructura exacta del API
      const createPredioDTO: CreatePredioDTO = {
        anio: data.anio || new Date().getFullYear(),
        codPredio: null, // Siempre null, se asigna automáticamente
        numeroFinca: parseInt(data.numeroFinca || '0'),
        otroNumero: data.otroNumero || '',
        codClasificacion: data.clasificacionPredio || '0502',
        estPredio: data.estadoPredio || '2503',
        codTipoPredio: data.tipoPredio || '2601',
        codCondicionPropiedad: data.condicionPropiedad || '2701',
        codDireccion: data.direccion?.codigo || data.direccion?.id || 2,
        codUsoPredio: parseInt(data.usoPredio || '1'),
        fechaAdquisicion: data.fechaAdquisicion ? 
          new Date(data.fechaAdquisicion).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        numeroCondominos: data.numeroCondominos ? parseInt(data.numeroCondominos.toString()) : 2,
        codListaConductor: data.conductor || '1401',
        codUbicacionAreaVerde: 1, // Valor por defecto
        areaTerreno: parseFloat(data.areaTerreno?.toString() || '0'),
        numeroPisos: parseInt(data.numeroPisos?.toString() || '1'),
        totalAreaConstruccion: null,
        valorTotalConstruccion: null,
        valorTerreno: null,
        autoavaluo: null,
        codEstado: '0201', // Estado activo por defecto
        codUsuario: 1 // Usuario por defecto
      };

      console.log('📡 Enviando datos al API:', createPredioDTO);
      
      // Preparar promesas para ejecución simultánea
      const promises: Promise<any>[] = [
        predioService.crearPredio(createPredioDTO)
      ];
      
      // Si hay imágenes seleccionadas, agregar la promesa de upload
      if (selectedImages.length > 0) {
        console.log(`🖼️ Subiendo ${selectedImages.length} imágenes...`);
        promises.push(uploadService.uploadMultipleFiles(selectedImages));
      }
      
      // Ejecutar ambas operaciones en simultáneo
      const [predioResult, uploadResults] = await Promise.all(promises);
      
      console.log('✅ Predio creado exitosamente:', predioResult);
      if (uploadResults) {
        console.log('✅ Imágenes subidas exitosamente:', uploadResults);
      }
      
      // Mensaje de éxito según lo que se haya hecho
      const successMessage = selectedImages.length > 0 
        ? `Predio registrado y ${selectedImages.length} imagen(es) subida(s) exitosamente`
        : 'Predio registrado exitosamente';
      NotificationService.success(successMessage);
      
      // Limpiar el formulario y las imágenes después del éxito
      reset();
      setSelectedImages([]);
      
      // Llamar al callback si existe
      if (onSubmit) {
        onSubmit({
          ...data,
          imagenes: selectedImages
        });
      }
      
      // Redireccionar a la página de consulta de predios con el predio recién creado
      setTimeout(() => {
        navigate('/predio/consulta', { 
          state: { 
            predioRecienCreado: predioResult,
            mensaje: successMessage 
          } 
        });
      }, 1500); // Pequeño delay para que el usuario vea el mensaje de éxito
    } catch (error: any) {
      console.error('❌ Error al crear predio o subir imágenes:', error);
      NotificationService.error(error.message || 'Error al registrar el predio o subir imágenes');
    }
  };

  // Función para construir la descripción completa de la dirección
  const buildDireccionCompleta = (direccion: any, numeroFinca?: string, otroNumero?: string) => {
    if (!direccion) return '';
    
    // Si tiene direccionCompleta, usar esa en lugar del formato anterior
    let descripcion = direccion.direccionCompleta 
      ? `${direccion.direccionCompleta}` 
      : `Año: ${direccion.anio} - Código Dirección: ${direccion.codigo}`;
    
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

  // Función para obtener el texto completo de la dirección
  const getDireccionTextoCompleto = (direccion: any, numeroFinca?: string, otroNumero?: string) => {
    return buildDireccionCompleta(direccion, numeroFinca, otroNumero);
  };

  // Manejar selección de arancel
  const handleSelectArancel = (arancel: ArancelData) => {
    console.log('🎯 [PredioForm] Arancel seleccionado:', arancel);
    
    // Crear un objeto con los datos de dirección y arancel
    const direccionData = {
      id: arancel.codDireccion,
      codigo: arancel.codDireccion,
      anio: arancel.anio,
      direccionCompleta: arancel.direccionCompleta, // Agregar el campo direccionCompleta
      descripcion: buildDireccionCompleta(
        { 
          anio: arancel.anio, 
          codigo: arancel.codDireccion,
          direccionCompleta: arancel.direccionCompleta 
        },
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
          {/* Header mejorado */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main'
                }}
              >
                {predioExistente ? <HomeIcon fontSize="medium" /> : <AddIcon fontSize="medium" />}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {predioExistente ? 'Editar Predio' : 'Registrar Nuevo Predio'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {predioExistente ? 'Modifique los datos del predio seleccionado' : 'Complete la información para registrar un nuevo predio en el sistema'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Datos del predio */}
                <Stack spacing={2}>
                {/* Primera fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Selector Año */}
                  <Box sx={{ 
                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 120px' },
                    minWidth: { xs: '100%', md: '120px' }
                  }}>
                    <Controller
                      name="anio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Año"
                          type="number"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
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
                  </Box>
                  {/* Fecha Adquisicion */}
                  <Box sx={{ flex: '0 0 160px', maxWidth:'160px' }}>
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
                  {/* Condicion de Propiedad */}
                  <Box sx={{ flex: '0 0 280px' }}>
                    {renderAutocomplete(
                      'condicionPropiedad',
                      'CondicionPropiedad',
                      condicionData || [],
                      loadingCondicion,
                      errorCondicion,
                      true
                    )}
                  </Box>
                  {/* Estado del  Predio */}
                  <Box sx={{ flex: '0 0 220px' }}>
                    {renderAutocomplete(
                      'estadoPredio',
                      'EstadoPredio',
                      estadoPredioData || [],
                      loadingEstadoPredio,
                      errorEstadoPredio,
                      false
                    )}
                  </Box>
                
                  
                </Box>

                {/* Segunda fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Tipo Predio */}
                  <Box sx={{ flex: '0 0 250px' }}>
                    {renderAutocomplete(
                      'tipoPredio',
                      'Tipo Predio',
                      tipoPredioData || [],
                      loadingTipoPredio,
                      errorTipoPredio,
                      false
                    )}
                  </Box>
                  {/* Clasificacion Predio */}
                  <Box sx={{ flex: '0 0 600px' }}>
                    {renderAutocomplete(
                      'clasificacionPredio',
                      'ClasificacionPredio',
                      clasificacionPredioData || [],
                      loadingClasificacionPredio,
                      errorClasificacionPredio,
                      false
                    )}
                  </Box>
                </Box>

                {/* Tercera fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Criterio Uso */}
                  <Box sx={{ flex: '0 0 600px' }}>
                    {renderAutocomplete(
                      'criterioUso',
                      'Criterio Uso',
                      criterioUsoData || [],
                      loadingCriterioUso,
                      errorCriterioUso,
                      false
                    )}
                  </Box>
                  
                  {/* Uso Predio */}
                  <Box sx={{ flex: '0 0 250px' }}>
                    {renderAutocomplete(
                      'usoPredio',
                      'Uso Predio',
                      usoPredioData || [],
                      loadingUsoPredio,
                      errorUsoPredio,
                      false
                    )}
                  </Box>
                </Box>

                {/* Cuarta fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                   {/* Lista Conductor*/}
                  <Box sx={{ flex: '0 0 150px' }}>
                    {renderAutocomplete(
                      'conductor',
                      'Lista Conductor',
                      conductorData || [],
                      loadingConductor,
                      errorConductor,
                      true
                    )}
                  </Box>
                   {/* Area m2*/}
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
                          value={field.value || ''}
                          InputProps={{
                            inputProps: { min: 0, step: 0.01 }
                          }}
                          error={!!errors.areaTerreno}
                          helperText={errors.areaTerreno?.message}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === undefined) {
                              field.onChange(undefined);
                            } else {
                              const numValue = parseFloat(value);
                              field.onChange(numValue >= 0 ? numValue : 0);
                            }
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Quinta fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                   {/* Buscar Direcccion */}
                  <Box sx={{ flex: '0 0 auto' }}>
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
                        Seleccionar dirección
                      </Button>
                  </Box>
                   {/* N finca */}
                  <Box sx={{ flex: '0 0 100px' }}>
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
                   {/* Otro N */}
                  <Box sx={{ flex: '0 0 100px' }}>
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
                   {/* arancel*/}
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

                {/* Sexta fila */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Dirección seleccionada */}
                  {direccionValue && (
                    <Box sx={{ 
                      flex: { xs: '1 1 100%', sm: '1 1 auto' },
                      minWidth: { xs: '100%', sm: '300px' },
                      width: { xs: '100%', sm: 'auto' }
                    }}> 
                      <Alert 
                        severity="info" 
                        sx={{ 
                          py: 0.5,
                          px: 1,
                          minHeight: 'auto',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          '& .MuiAlert-message': { 
                            py: 0,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem'
                          },
                          '& .MuiAlert-icon': {
                            fontSize: '1rem',
                            paddingTop: 0,
                            marginRight: 0.5
                          }}}
                      >
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                          📍 {getDireccionTextoCompleto(direccionValue, numeroFincaValue || '', otroNumeroValue)}
                        </Typography>
                      </Alert>
                    </Box>
                  )}
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
                    Seleccionar foto
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<DescriptionIcon />}
                  >
                    Seleccionar Plano
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
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

              {/* Botón Registrar */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => reset()}
                  size="large"
                >
                  Nuevo
                </Button>
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