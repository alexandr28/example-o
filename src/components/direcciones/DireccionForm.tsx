// src/components/direcciones/DireccionForm.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  Button,
  Paper,
  CircularProgress,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DireccionData, CreateDireccionDTO } from '../../services/direccionService';
import { SectorData } from '../../services/SectorService';
import { BarrioData } from '../../services/barrioService';
import { CalleData } from '../../services/calleApiService';
import { useTiposLadosDireccion, useRutasOptions, useZonasOptions, useUbicacionAreaVerdeOptions } from '../../hooks/useConstantesOptions';
import { useCalles } from '../../hooks/useCalles';

// Tipo para las opciones de lado
interface LadoOption {
  value: string;
  label: string;
  id: string;
}

// Fallback options if API fails - match OptionFormat interface
const FALLBACK_LADO_OPTIONS: LadoOption[] = [
  { value: 'NINGUNO', label: 'NINGUNO', id: '8103' },
  { value: 'PAR', label: 'PAR', id: '8101' },
  { value: 'IMPAR', label: 'IMPAR', id: '8102' }
];

// Schema de validación
const direccionSchema = z.object({
  codigoSector: z.number({
    required_error: 'El sector es requerido',
    invalid_type_error: 'Seleccione un sector válido'
  }).nullable().refine((val) => val !== null && val > 0, {
    message: 'Seleccione un sector'
  }),
  
  codigoBarrio: z.number({
    invalid_type_error: 'Seleccione un barrio válido'
  }).nullable().optional(),
  
  codigoCalle: z.number({
    invalid_type_error: 'Seleccione una calle válida'
  }).nullable().optional(),

  cuadra: z.coerce.number().nullable().optional(),

  manzana: z.string().optional(),

  lado: z.string(),
  
  loteInicial: z.coerce.number()
    .min(0, 'El lote inicial debe ser mayor o igual a 0'),
  
  loteFinal: z.coerce.number()
    .min(0, 'El lote final debe ser mayor o igual a 0'),
    
  ruta: z.number({
    invalid_type_error: 'Seleccione una ruta válida'
  }).nullable().optional(),

  zona: z.number({
    invalid_type_error: 'Seleccione una zona válida'
  }).nullable().optional(),

  ubicacionAreaVerde: z.number({
    invalid_type_error: 'Seleccione una ubicación válida'
  }).nullable().optional(),
});

type DireccionFormData = z.infer<typeof direccionSchema>;

interface DireccionFormProps {
  direccionSeleccionada?: DireccionData | null;
  sectores: SectorData[];
  barrios: BarrioData[];
  calles: CalleData[];
  barriosFiltrados: BarrioData[];
  callesFiltradas: CalleData[];
  onSubmit: (data: CreateDireccionDTO) => Promise<void>;
  onNuevo: () => void;
  onEditar: () => void;
  onDelete?: (id: number) => Promise<void>;
  onSectorChange: (sectorId: number) => void;
  onBarrioChange: (barrioId: number) => void;
  loading?: boolean;
  loadingSectores?: boolean;
  loadingBarrios?: boolean;
  loadingCalles?: boolean;
  isEditMode?: boolean;
}


const DireccionFormMUI: React.FC<DireccionFormProps> = ({
  direccionSeleccionada,
  sectores: sectoresFromProps,
  barriosFiltrados: barriosFiltradosFromProps,
  callesFiltradas: callesFitradasFromProps,
  onSubmit,
  onNuevo,
  onEditar,
  onDelete,
  onSectorChange: onSectorChangeFromProps,
  onBarrioChange: onBarrioChangeFromProps,
  loading = false,
  loadingSectores: loadingSectoresFromProps = false,
  loadingBarrios: loadingBarriosFromProps = false,
  loadingCalles: loadingCallesFromProps = false,
  isEditMode = false
}) => {
  // Hook para calles, sectores y barrios relacionados
  const {
    sectores,
    barrios,
    barriosFiltrados,
    calles,
    loadingSectores,
    loadingBarrios,
    loading: loadingCalles,
    filtrarBarriosPorSector
  } = useCalles();

  // Hook para tipos de lados direccion
  const { options: ladoOptions, loading: loadingLados } = useTiposLadosDireccion();
  
  // Hook para rutas
  const { options: rutaOptions, loading: loadingRutas } = useRutasOptions();
  
  // Hook para zonas
  const { options: zonaOptions, loading: loadingZonas } = useZonasOptions();
  
  // Hook para ubicación área verde
  const { options: ubicacionAreaVerdeOptions, loading: loadingUbicacionAreaVerde } = useUbicacionAreaVerdeOptions();
  
  // Use fallback if no options and not loading - ensure consistent typing
  const effectiveLadoOptions: LadoOption[] = React.useMemo(() => {
    return ladoOptions && ladoOptions.length > 0 
      ? ladoOptions.map(option => ({
          value: String(option.value),
          label: String(option.label), 
          id: String(option.id)
        }))
      : (!loadingLados ? FALLBACK_LADO_OPTIONS : []);
  }, [ladoOptions, loadingLados]);

  // Estado para el modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Debug log
  console.log('🔍 [DireccionForm] ladoOptions:', ladoOptions, 'loading:', loadingLados);
  console.log('🔍 [DireccionForm] ladoOptions length:', ladoOptions?.length);
  console.log('🔍 [DireccionForm] ladoOptions type:', typeof ladoOptions);
  console.log('🔍 [DireccionForm] ladoOptions isArray:', Array.isArray(ladoOptions));
  console.log('🔍 [DireccionForm] effectiveLadoOptions:', effectiveLadoOptions);
  console.log('🔍 [DireccionForm] effectiveLadoOptions length:', effectiveLadoOptions?.length);
  
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<DireccionFormData>({
    resolver: zodResolver(direccionSchema),
    defaultValues: {
      codigoSector: null,
      codigoBarrio: null,
      codigoCalle: null,
      cuadra: null,
      manzana: '',
      lado: '',
      loteInicial: 0,
      loteFinal: 0,
      ruta: null as any,
      zona: null as any,
      ubicacionAreaVerde: null as any
    }
  });

  // Set default lado when options load - only on initial mount
  useEffect(() => {
    if (effectiveLadoOptions && effectiveLadoOptions.length > 0 && !direccionSeleccionada && !isEditMode) {
      // Use NINGUNO as default
      const ningunoOption = effectiveLadoOptions.find(opt => opt.value === 'NINGUNO');
      if (ningunoOption) {
        setValue('lado', ningunoOption.value);
      }
    }
  }, []);

  const sectorValue = watch('codigoSector');
  const barrioValue = watch('codigoBarrio');

  // Estado local para calles filtradas por barrio
  const [callesFiltradas, setCallesFiltradas] = React.useState<CalleData[]>([]);

  // Filtrar calles cuando cambia el sector o barrio
  useEffect(() => {
    if (sectorValue && sectorValue > 0) {
      // Filtrar calles por sector
      let filtered = calles.filter(c => c.codSector === sectorValue);

      // Si hay barrio seleccionado, filtrar también por barrio
      if (barrioValue && barrioValue > 0) {
        filtered = filtered.filter(c => c.codBarrio === barrioValue);
      }

      setCallesFiltradas(filtered);
    } else {
      setCallesFiltradas([]);
    }
  }, [sectorValue, barrioValue, calles]);

  // Efecto para cargar datos cuando se selecciona una dirección
  useEffect(() => {
    if (direccionSeleccionada && isEditMode) {
      console.log('📝 [DireccionForm] Cargando dirección seleccionada:', direccionSeleccionada);
      console.log('📝 [DireccionForm] Modo edición:', isEditMode);
      console.log('📝 [DireccionForm] onDelete disponible:', !!onDelete);

      // Primero establecer el sector para que se filtren los barrios
      if (direccionSeleccionada.codigoSector) {
        filtrarBarriosPorSector(direccionSeleccionada.codigoSector);
      }
      
      // Pequeño delay para asegurar que los filtrados se actualicen
      const timeoutId = setTimeout(() => {
        // Buscar el valor por defecto de lado usando effectiveLadoOptions que está memoizado
        const defaultLado = effectiveLadoOptions?.find(opt => opt.value === 'NINGUNO')?.value || 
                           effectiveLadoOptions?.[0]?.value || 
                           'NINGUNO';
        
        reset({
          codigoSector: direccionSeleccionada.codigoSector || 0,
          codigoBarrio: direccionSeleccionada.codigoBarrio || 0,
          codigoCalle: direccionSeleccionada.codigoCalle || 0,
          cuadra: direccionSeleccionada.cuadra ? parseInt(direccionSeleccionada.cuadra) : null,
          manzana: (direccionSeleccionada as any).manzana || '',
          lado: direccionSeleccionada.lado || defaultLado,
          loteInicial: direccionSeleccionada.loteInicial || 0,
          loteFinal: direccionSeleccionada.loteFinal || 0,
          ruta: (direccionSeleccionada as any).ruta || undefined,
          zona: (direccionSeleccionada as any).zona || undefined,
          ubicacionAreaVerde: (direccionSeleccionada as any).ubicacionAreaVerde || undefined
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!direccionSeleccionada && !isEditMode) {
      // Limpiar el formulario cuando no hay selección
      const defaultLado = effectiveLadoOptions?.find(opt => opt.value === 'NINGUNO')?.value ||
                         effectiveLadoOptions?.[0]?.value ||
                         'NINGUNO';
      reset({
        codigoSector: null,
        codigoBarrio: null,
        codigoCalle: null,
        cuadra: null,
        manzana: '',
        lado: defaultLado,
        loteInicial: 0,
        loteFinal: 0,
        ruta: null as any,
        zona: null as any,
        ubicacionAreaVerde: null as any
      });
    }
  }, [direccionSeleccionada, isEditMode, reset, filtrarBarriosPorSector, effectiveLadoOptions, onDelete]);

  // Efecto para manejar cambio de sector
  useEffect(() => {
    if (sectorValue && sectorValue > 0) {
      filtrarBarriosPorSector(sectorValue);
      // Limpiar barrio y calle solo si cambia manualmente (no en carga inicial)
      if (!isEditMode) {
        setValue('codigoBarrio', 0);
        setValue('codigoCalle', 0);
      }
    }
  }, [sectorValue, filtrarBarriosPorSector, setValue, isEditMode]);

  const handleFormSubmit = async (data: DireccionFormData) => {
    try {
      // Asegurar que los datos están en el formato correcto para el nuevo API
      // JSON: { codSector, codBarrio, codVia, cuadra, manzana, codLado, loteInicial, loteFinal, codZona, codRuta, codUbicacionAreaVerde, parametroBusqueda, codUsuario }
      const direccionData: CreateDireccionDTO = {
        codigoSector: data.codigoSector || 0,
        codigoBarrio: (data.codigoBarrio && data.codigoBarrio > 0) ? data.codigoBarrio : null,
        codigoCalle: (data.codigoCalle && data.codigoCalle > 0) ? data.codigoCalle : null,
        cuadra: data.cuadra || null,
        manzana: data.manzana || null,
        lado: data.lado || (effectiveLadoOptions?.find(opt => opt.value === 'NINGUNO')?.value || effectiveLadoOptions?.[0]?.value || 'NINGUNO'),
        loteInicial: data.loteInicial || 1,
        loteFinal: data.loteFinal || 20,
        ruta: data.ruta || null,
        zona: data.zona || null,
        ubicacionAreaVerde: data.ubicacionAreaVerde || null,
        codUsuario: 1
      };

      console.log('📤 [DireccionForm] Enviando datos al API:', direccionData);
      await onSubmit(direccionData);

      if (!isEditMode) {
        reset();
      }
    } catch (error) {
      console.error('❌ [DireccionForm] Error al guardar dirección:', error);
    }
  };

  const handleNuevoClick = () => {
    reset();
    onNuevo();
  };

  // Manejar apertura del modal de eliminación
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Manejar cierre del modal de eliminación
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  // Manejar confirmación de eliminación
  const handleDeleteConfirm = async () => {
    if (direccionSeleccionada && onDelete) {
      const idToDelete = direccionSeleccionada.codigo || direccionSeleccionada.id;
      if (idToDelete) {
        try {
          await onDelete(idToDelete);
          setDeleteModalOpen(false);
          reset();
        } catch (error) {
          console.error('Error al eliminar dirección:', error);
        }
      }
    }
  };

  // Watch lote values for validation
  const loteInicialValue = watch('loteInicial');
  const loteFinalValue = watch('loteFinal');

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        

        {/* Primera fila - Campos principales */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'flex-start',
          gap: { xs: 1.5, sm: 2 },
          mb: 2
        }}>
          {/* Sector */}
          <Box sx={{
            flex: { xs: '1 1 100%', sm: '1 1 280px', md: '0 0 300px' },
            minWidth: { xs: '100%', sm: '280px', md: '300px' },
            maxWidth: { xs: '100%', sm: '100%', md: '300px' }
          }}>
              <Controller
                name="codigoSector"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.codigoSector}>
                  <Autocomplete
                    {...field}
                    options={sectores}
                    getOptionKey={(option) => `sector-${option.codSector}`}
                    getOptionLabel={(option) =>
                      typeof option === 'number'
                        ? sectores.find(s => s.codSector === option)?.nombreSector || ''
                        : option.nombreSector
                    }
                    value={sectores.find(s => s.codSector === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.codSector || null);
                    }}
                    loading={loadingSectores}
                    disabled={loading || loadingSectores}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sector"
                        error={!!errors.codigoSector}
                        helperText={errors.codigoSector?.message}
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'40px'
                          }
                        }}
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingSectores ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}

                  />
                </FormControl>
              )}
            />
          </Box>

          {/* Barrio */}
          <Box sx={{
            flex: { xs: '1 1 100%', sm: '1 1 220px', md: '0 0 200px' },
            minWidth: { xs: '100%', sm: '220px', md: '200px' },
            maxWidth: { xs: '100%', sm: '100%', md: '200px' }
          }}>
            <Controller
              name="codigoBarrio"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.codigoBarrio}>
                  <Autocomplete
                    {...field}
                    options={barriosFiltrados}
                    getOptionKey={(option) => `barrio-${option.codigo}`}
                    getOptionLabel={(option) =>
                      typeof option === 'number'
                        ? barriosFiltrados.find(b => b.codigo === option)?.nombre || ''
                        : option.nombre
                    }
                    value={barriosFiltrados.find(b => b.codigo === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.codigo || null);
                    }}
                    loading={loadingBarrios}
                    disabled={loading || loadingBarrios || !sectorValue}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Barrio (Opcional)"
                        error={!!errors.codigoBarrio}
                        helperText={errors.codigoBarrio?.message || (!sectorValue ? 'Seleccione un sector primero' : barriosFiltrados.length === 0 ? 'No hay barrios para este sector' : '')}
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'40px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingBarrios ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>

          {/* Calle/Mz */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 240px', md: '0 0 300px' }, 
            minWidth: { xs: '100%', sm: '240px', md: '300px' },
            maxWidth: { xs: '100%', sm: '100%', md: '300px' }
          }}>
            <Controller
              name="codigoCalle"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.codigoCalle}>
                  <Autocomplete
                    {...field}
                    options={callesFiltradas}
                    getOptionKey={(option) => `calle-${option.codigo}`}
                    getOptionLabel={(option) =>
                      typeof option === 'number'
                        ? callesFiltradas.find(c => c.codigo === option)?.nombre || ''
                        : option.nombre || ''
                    }
                    value={callesFiltradas.find(c => c.codigo === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.codigo || null);
                    }}
                    loading={loadingCalles}
                    disabled={loading || loadingCalles || !sectorValue}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Calle"
                        error={!!errors.codigoCalle}
                        helperText={errors.codigoCalle?.message || (!sectorValue ? 'Seleccione un sector primero' : '')}
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'40px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCalles ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* Segunda fila - Lado, Cuadra, Lote Inicial */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'flex-start',
          gap: { xs: 1.5, sm: 2 },
          mb: 3
        }}>
          {/* Lado */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '0 0 200px', md: '0 0 200px' }, 
            minWidth: { xs: '100%', sm: '200px', md: '200px' }
          }}>
            <Controller
              name="lado"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.lado}>
                  <Autocomplete
                    {...field}
                    options={effectiveLadoOptions}
                    getOptionKey={(option) => `lado-${option.value}`}
                    getOptionLabel={(option) => 
                      typeof option === 'string' 
                        ? effectiveLadoOptions.find(opt => opt.value === option)?.label || option
                        : option.label
                    }
                    value={effectiveLadoOptions.find(opt => opt.value === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value || '');
                    }}
                    loading={loadingLados}
                    disabled={loading || loadingLados}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lado"
                        error={!!errors.lado}
                        helperText={errors.lado?.message}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }  
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingLados ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>

          {/* Cuadra */}
          <Box sx={{
            flex: { xs: '1 1 48%', sm: '0 0 150px', md: '0 0 150px' },
            minWidth: { xs: '48%', sm: '150px', md: '150px' }
          }}>
            <Controller
              name="cuadra"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value === null || field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? null : parseInt(value, 10) || null);
                  }}
                  fullWidth
                  type="number"
                  label="Cuadra"
                  placeholder="Ej: 10"
                  error={!!errors.cuadra}
                  helperText={errors.cuadra?.message}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    },
                  }}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              )}
            />
          </Box>

          {/* Manzana */}
          <Box sx={{
            flex: { xs: '1 1 48%', sm: '0 0 150px', md: '0 0 150px' },
            minWidth: { xs: '48%', sm: '150px', md: '150px' }
          }}>
            <Controller
              name="manzana"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Manzana"
                  placeholder="Ej: A"
                  error={!!errors.manzana}
                  helperText={errors.manzana?.message}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Lote Inicial */}
          <Box sx={{ 
            flex: { xs: '1 1 48%', sm: '0 0 150px', md: '0 0 150px' }, 
            minWidth: { xs: '48%', sm: '150px', md: '150px' }
          }}>
            <Controller
              name="loteInicial"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseInt(value, 10) || 0);
                  }}
                  onFocus={(e) => {
                    if (field.value === 0) {
                      e.target.select();
                    }
                  }}
                  fullWidth
                  type="number"
                  label="Lote Inicial"
                  error={!!errors.loteInicial}
                  helperText={errors.loteInicial?.message}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              )}
            />
          </Box>

          {/* Lote Final */}
          <Box sx={{ 
            flex: { xs: '1 1 48%', sm: '0 0 150px', md: '0 0 150px' }, 
            minWidth: { xs: '48%', sm: '150px', md: '150px' }
          }}>
            <Controller
              name="loteFinal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseInt(value, 10) || 0);
                  }}
                  onFocus={(e) => {
                    if (field.value === 0) {
                      e.target.select();
                    }
                  }}
                  fullWidth
                  type="number"
                  label="Lote Final"
                  error={!!errors.loteFinal}
                  helperText={errors.loteFinal?.message}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              )}
            />
          </Box>

          {/* Ruta */}
          <Box sx={{ 
            flex: { xs: '1 1 48%', sm: '0 0 200px', md: '0 0 200px' }, 
            minWidth: { xs: '48%', sm: '200px', md: '200px' }
          }}>
            <Controller
              name="ruta"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.ruta}>
                  <Autocomplete
                    {...field}
                    options={rutaOptions || []}
                    getOptionKey={(option) => `ruta-${typeof option === 'number' ? option : option.value}`}
                    getOptionLabel={(option) => 
                      typeof option === 'number' 
                        ? rutaOptions?.find(r => r.value === option)?.label || `Ruta ${option}`
                        : option.label || ''
                    }
                    value={rutaOptions?.find(r => r.value === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value || null);
                    }}
                    loading={loadingRutas}
                    disabled={loading || loadingRutas}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ruta"
                        error={!!errors.ruta}
                        helperText={errors.ruta?.message}
                        placeholder="Seleccione una ruta"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingRutas ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <Box component="li" key={key} {...optionProps}>
                          <Box>
                            <strong>{option.abreviatura}</strong>
                            {option.descripcion && (
                              <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                                - {option.descripcion}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
                  />
                </FormControl>
              )}
            />
          </Box>

          {/* Zona */}
          <Box sx={{
            flex: { xs: '1 1 48%', sm: '0 0 200px', md: '0 0 200px' },
            minWidth: { xs: '48%', sm: '200px', md: '200px' }
          }}>
            <Controller
              name="zona"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.zona}>
                  <Autocomplete
                    {...field}
                    options={zonaOptions || []}
                    getOptionKey={(option) => `zona-${typeof option === 'number' ? option : option.value}`}
                    getOptionLabel={(option) =>
                      typeof option === 'number'
                        ? zonaOptions?.find(z => z.value === option)?.label || `Zona ${option}`
                        : option.label || ''
                    }
                    value={zonaOptions?.find(z => z.value === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value || null);
                    }}
                    loading={loadingZonas}
                    disabled={loading || loadingZonas}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Zona"
                        error={!!errors.zona}
                        helperText={errors.zona?.message}
                        placeholder="Seleccione una zona"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingZonas ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <Box component="li" key={key} {...optionProps}>
                          <Box>
                            <strong>{option.abreviatura}</strong>
                            {option.descripcion && (
                              <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                                - {option.descripcion}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
                  />
                </FormControl>
              )}
            />
          </Box>

          {/* Ubicación Área Verde */}
          <Box sx={{ 
            flex: { xs: '1 1 48%', sm: '0 0 250px', md: '0 0 250px' }, 
            minWidth: { xs: '48%', sm: '250px', md: '250px' }
          }}>
            <Controller
              name="ubicacionAreaVerde"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <Autocomplete
                    {...field}
                    options={ubicacionAreaVerdeOptions || []}
                    getOptionKey={(option) => `ubicacion-${typeof option === 'number' ? option : option.value}`}
                    getOptionLabel={(option) => 
                      typeof option === 'number' 
                        ? ubicacionAreaVerdeOptions?.find(u => u.value === option)?.label || `Ubicación ${option}`
                        : option.label || ''
                    }
                    value={ubicacionAreaVerdeOptions?.find(u => u.value === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value || null);
                    }}
                    loading={loadingUbicacionAreaVerde}
                    disabled={loading || loadingUbicacionAreaVerde}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ubicación Área Verde"
                        placeholder="Seleccione una ubicación"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingUbicacionAreaVerde ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <Box component="li" key={key} {...optionProps}>
                          <Box>
                            <strong>{option.abreviatura}</strong>
                            {option.descripcion && (
                              <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                                - {option.descripcion}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
                  />
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* Botones de acción responsive */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 }, 
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || isSubmitting}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isEditMode ? 'Actualizar' : 'Guardar'}
          </Button>

          {direccionSeleccionada && !isEditMode && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={onEditar}
              disabled={loading}
              startIcon={<EditIcon />}
            >
              Editar
            </Button>
          )}

          {direccionSeleccionada && (direccionSeleccionada.codigo || direccionSeleccionada.id) && isEditMode && onDelete && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteClick}
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              Eliminar
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={handleNuevoClick}
            disabled={loading}
            startIcon={<AddIcon />}
          >
            Nuevo
          </Button>
        </Box>
      </Box>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'error.main',
            fontWeight: 600
          }}
        >
          <DeleteIcon />
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="delete-dialog-description"
            sx={{ 
              fontSize: '1rem',
              color: 'text.primary',
              mb: 1
            }}
          >
            ¿Está seguro que desea eliminar esta dirección?
          </DialogContentText>
          <DialogContentText 
            sx={{ 
              fontSize: '0.875rem',
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DireccionFormMUI;