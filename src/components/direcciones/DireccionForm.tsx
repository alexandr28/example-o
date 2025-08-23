// src/components/direcciones/DireccionForm.tsx
import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  FormHelperText,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DireccionData, CreateDireccionDTO } from '../../services/direccionService';
import { SectorData } from '../../services/sectorService';
import { BarrioData } from '../../services/barrioService';
import { CalleData } from '../../services/calleApiService';

// Schema de validación
const direccionSchema = z.object({
  codigoSector: z.number({
    required_error: 'El sector es requerido',
    invalid_type_error: 'Seleccione un sector válido'
  }).nullable().refine((val) => val !== null && val > 0, {
    message: 'Seleccione un sector'
  }),
  
  codigoBarrio: z.number({
    required_error: 'El barrio es requerido',
    invalid_type_error: 'Seleccione un barrio válido'
  }).nullable().refine((val) => val !== null && val > 0, {
    message: 'Seleccione un barrio'
  }),
  
  codigoCalle: z.number({
    required_error: 'La calle/Mz es requerida',
    invalid_type_error: 'Seleccione una calle válida'
  }).nullable().refine((val) => val !== null && val > 0, {
    message: 'Seleccione una calle/Mz'
  }),
  
  cuadra: z.string().optional(),
  
  lado: z.string(),
  
  loteInicial: z.coerce.number()
    .min(0, 'El lote inicial debe ser mayor o igual a 0'),
  
  loteFinal: z.coerce.number()
    .min(0, 'El lote final debe ser mayor o igual a 0'),
}).refine((data) => data.loteFinal >= data.loteInicial, {
  message: 'El lote final debe ser mayor o igual al lote inicial',
  path: ['loteFinal'],
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
  onSectorChange: (sectorId: number) => void;
  onBarrioChange: (barrioId: number) => void;
  loading?: boolean;
  loadingSectores?: boolean;
  loadingBarrios?: boolean;
  loadingCalles?: boolean;
  isEditMode?: boolean;
}

const ladoOptions = [
  { value: 'Ninguno', label: 'Ninguno' },
  { value: 'Izquierdo', label: 'Izquierdo' },
  { value: 'Derecho', label: 'Derecho' },
  { value: 'Par', label: 'Par' },
  { value: 'Impar', label: 'Impar' }
];

const DireccionFormMUI: React.FC<DireccionFormProps> = ({
  direccionSeleccionada,
  sectores,
  barrios,
  calles,
  barriosFiltrados,
  callesFiltradas,
  onSubmit,
  onNuevo,
  onEditar,
  onSectorChange,
  onBarrioChange,
  loading = false,
  loadingSectores = false,
  loadingBarrios = false,
  loadingCalles = false,
  isEditMode = false
}) => {
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
      cuadra: '',
      lado: 'Ninguno',
      loteInicial: 0,
      loteFinal: 0
    }
  });

  const sectorValue = watch('codigoSector');
  const barrioValue = watch('codigoBarrio');

  // Efecto para cargar datos cuando se selecciona una dirección
  useEffect(() => {
    if (direccionSeleccionada && isEditMode) {
      reset({
        codigoSector: direccionSeleccionada.codigoSector || 0,
        codigoBarrio: direccionSeleccionada.codigoBarrio || 0,
        codigoCalle: direccionSeleccionada.codigoCalle || 0,
        cuadra: direccionSeleccionada.cuadra || '',
        lado: direccionSeleccionada.lado || 'Ninguno',
        loteInicial: direccionSeleccionada.loteInicial || 0,
        loteFinal: direccionSeleccionada.loteFinal || 0
      });
    }
  }, [direccionSeleccionada, isEditMode, reset]);

  // Efecto para manejar cambio de sector
  useEffect(() => {
    if (sectorValue > 0) {
      onSectorChange(sectorValue);
      // Limpiar barrio y calle si no es modo edición
      if (!isEditMode) {
        setValue('codigoBarrio', 0);
        setValue('codigoCalle', 0);
      }
    }
  }, [sectorValue, onSectorChange, setValue, isEditMode]);

  // Efecto para manejar cambio de barrio
  useEffect(() => {
    if (barrioValue > 0) {
      onBarrioChange(barrioValue);
      // Limpiar calle si no es modo edición
      if (!isEditMode) {
        setValue('codigoCalle', 0);
      }
    }
  }, [barrioValue, onBarrioChange, setValue, isEditMode]);

  const handleFormSubmit = async (data: DireccionFormData) => {
    try {
      // Asegurar que los datos están en el formato correcto para el servicio
      const direccionData: CreateDireccionDTO = {
        codigoSector: data.codigoSector || 0,
        codigoBarrio: data.codigoBarrio || 0,
        codigoCalle: data.codigoCalle || 0,
        cuadra: data.cuadra || '',
        lado: data.lado || 'Ninguno',
        loteInicial: data.loteInicial || 1,
        loteFinal: data.loteFinal || 20
      };
      
      console.log('📤 [DireccionForm] Enviando datos:', direccionData);
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

  // Validar lotes
  const loteInicialValue = watch('loteInicial');
  const loteFinalValue = watch('loteFinal');

  useEffect(() => {
    if (loteFinalValue < loteInicialValue) {
      setValue('loteFinal', loteInicialValue);
    }
  }, [loteInicialValue, loteFinalValue, setValue]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LocationIcon />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Datos de la Dirección
          </Typography>
        </Box>

        {/* Fila única con todos los campos del formulario */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3
        }}>
          {/* Sector */}
          <Box sx={{ flex: '0 0 150px', minWidth: '150px' }}>
              <Controller
                name="codigoSector"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.codigoSector}>
                  <Autocomplete
                    {...field}
                    options={sectores}
                    getOptionKey={(option) => `sector-${option.codigo}`}
                    getOptionLabel={(option) => 
                      typeof option === 'number' 
                        ? sectores.find(s => s.codigo === option)?.nombre || ''
                        : option.nombre
                    }
                    value={sectores.find(s => s.codigo === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.codigo || null);
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
                             height:'33px'
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
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
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
                        label="Barrio"
                        error={!!errors.codigoBarrio}
                        helperText={errors.codigoBarrio?.message || (!sectorValue ? 'Seleccione primero un sector' : '')}
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'33px'
                          }  
                        }}
                        required
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
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
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
                        : option.nombre
                    }
                    value={callesFiltradas.find(c => c.codigo === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.codigo || null);
                    }}
                    loading={loadingCalles}
                    disabled={loading || loadingCalles || !barrioValue}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Calle / Mz"
                        error={!!errors.codigoCalle}
                        helperText={errors.codigoCalle?.message || (!barrioValue ? 'Seleccione primero un barrio' : '')}
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'33px'
                          }  
                        }}
                        required
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
          
          {/* Cuadra */}
          <Box sx={{ flex: '0 0 100px', minWidth: '100px' }}>
            <Controller
              name="cuadra"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Cuadra"
                  placeholder="Ej: 10"
                  error={!!errors.cuadra}
                  helperText={errors.cuadra?.message}
                />
              )}
            />
          </Box>

          {/* Lado */}
          <Box sx={{ flex: '0 0 120px', minWidth: '120px' }}>
            <Controller
              name="lado"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Lado</InputLabel>
                  <Select
                    {...field}
                    label="Lado"
                  >
                    {ladoOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {/* Lote Inicial */}
          <Box sx={{ flex: '0 0 100px', minWidth: '100px' }}>
            <Controller
              name="loteInicial"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseInt(value, 10) || 0);
                  }}
                  fullWidth
                  type="number"
                  label="Lote Inicial"
                  error={!!errors.loteInicial}
                  helperText={errors.loteInicial?.message}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              )}
            />
          </Box>

          {/* Lote Final */}
          <Box sx={{ flex: '0 0 100px', minWidth: '100px' }}>
            <Controller
              name="loteFinal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseInt(value, 10) || 0);
                  }}
                  fullWidth
                  type="number"
                  label="Lote Final"
                  error={!!errors.loteFinal}
                  helperText={errors.loteFinal?.message}
                  InputProps={{
                    inputProps: { min: loteInicialValue || 0 }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Segunda fila: Botones de acción */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end',
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
    </Paper>
  );
};

export default DireccionFormMUI;