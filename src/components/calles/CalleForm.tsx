// src/components/calles/CalleForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { CalleFormData } from '../../models/Calle';
import { CreateCalleDTO } from '../../services/calleApiService';
import { useSectores } from '../../hooks/useSectores';
import { useBarrios } from '../../hooks/useBarrios';
import { buildApiUrl } from '../../config/api.unified.config';

// Esquema de validación
const schema = yup.object().shape({
  tipoVia: yup
    .mixed()
    .required('El tipo de vía es requerido')
    .test('is-valid', 'Debe seleccionar un tipo de vía válido', 
      value => value && Number(value) > 0),
  codSector: yup
    .mixed()
    .required('El sector es requerido')
    .test('is-valid', 'Debe seleccionar un sector válido', 
      value => value && Number(value) > 0),
  codBarrio: yup
    .mixed()
    .required('El barrio es requerido')
    .test('is-valid', 'Debe seleccionar un barrio válido', 
      value => value && Number(value) > 0),
  nombreCalle: yup
    .string()
    .trim()
    .required('El nombre de la calle es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

interface CalleFormProps {
  onSubmit: (data: CalleFormData) => void | Promise<void>;
  onCancel?: () => void;
  onNew?: () => void;
  onEdit?: () => void;
  initialData?: Partial<CalleFormData>;
  isSubmitting?: boolean;
}

interface TipoViaOption {
  codConstante: number;
  nombre: string;
  descripcion?: string;
}

const CalleForm: React.FC<CalleFormProps> = ({
  onSubmit,
  onCancel,
  onNew,
  onEdit,
  initialData,
  isSubmitting = false
}) => {
  const theme = useTheme();
  const [tiposVia, setTiposVia] = useState<TipoViaOption[]>([]);
  const [loadingTiposVia, setLoadingTiposVia] = useState(false);
  const [errorTiposVia, setErrorTiposVia] = useState<string | null>(null);
  
  // Usar hooks para sectores y barrios
  const { sectores, loading: loadingSectores, error: errorSectores } = useSectores();
  const { 
    barrios: todosLosBarrios,
    loading: loadingBarrios, 
    error: errorBarrios 
  } = useBarrios();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<CalleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      tipoVia: initialData?.tipoVia || '',
      codSector: initialData?.codSector || '',
      codBarrio: initialData?.codBarrio || '',
      nombreCalle: initialData?.nombreCalle || '',
    }
  });

  const selectedSector = watch('codSector');

  // Cargar tipos de vía
  useEffect(() => {
    const cargarTiposVia = async () => {
      setLoadingTiposVia(true);
      setErrorTiposVia(null);
      
      try {
        const formData = new URLSearchParams();
        formData.append('codConstante', '38');
        
        const baseUrl = buildApiUrl('/api/constante/listarConstantePadre');
        const url = `${baseUrl}?${formData.toString()}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          const tiposViaFormateados = data.data.map((item: any) => ({
            codConstante: parseInt(item.codConstante),
            nombre: item.nombreCategoria || item.nombre,
            descripcion: item.descripcion || ''
          }));
          
          setTiposVia(tiposViaFormateados);
        }
      } catch (error) {
        console.error('Error al cargar tipos de vía:', error);
        setErrorTiposVia('Error al cargar tipos de vía');
      } finally {
        setLoadingTiposVia(false);
      }
    };

    cargarTiposVia();
  }, []);

  // Reset del formulario con datos iniciales
  useEffect(() => {
    if (initialData) {
      reset({
        tipoVia: initialData.tipoVia || 0,
        codSector: initialData.codSector || 0,
        codBarrio: initialData.codBarrio || 0,
        nombreCalle: initialData.nombreCalle || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: CalleFormData) => {
    try {
      console.log('📋 [CalleForm] Datos del formulario:', data);
      
      // El hook useCalles espera un formato diferente
      // Vamos a enviar ambos formatos para compatibilidad
      const datosParaHook = {
        sectorId: Number(data.codSector),
        barrioId: Number(data.codBarrio),
        tipoVia: String(data.tipoVia),
        nombre: data.nombreCalle.trim(),
        // También incluir los datos en formato API
        codTipoVia: Number(data.tipoVia),
        nombreVia: data.nombreCalle.trim(),
        codSector: Number(data.codSector),
        codBarrio: Number(data.codBarrio)
      };
      
      console.log('📤 [CalleForm] Enviando datos:', datosParaHook);
      
      // Validar que todos los campos tengan valores válidos
      if (!data.tipoVia || Number(data.tipoVia) === 0) {
        console.error('❌ Tipo de vía no válido:', data.tipoVia);
        return;
      }
      
      if (!data.nombreCalle || data.nombreCalle.trim() === '') {
        console.error('❌ Nombre de vía vacío');
        return;
      }
      
      if (!data.codSector || Number(data.codSector) === 0) {
        console.error('❌ Sector no válido:', data.codSector);
        return;
      }
      
      if (!data.codBarrio || Number(data.codBarrio) === 0) {
        console.error('❌ Barrio no válido:', data.codBarrio);
        return;
      }
      
      // Enviar los datos
      await onSubmit(datosParaHook as any);
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
    }
  };

  const handleNew = () => {
    reset({
      tipoVia: '',
      codSector: '',
      codBarrio: '',
      nombreCalle: ''
    });
    onNew?.();
  };

  // Preparar opciones para SearchableSelect
  const tipoViaOptions = tiposVia.map(tipo => ({
    value: tipo.codConstante,
    label: tipo.nombre
  }));

  const sectorOptions = (sectores || []).map(sector => ({
    value: sector.id,
    label: sector.nombre || 'Sin nombre'
  }));

  const barrioOptions = (todosLosBarrios || []).map(barrio => ({
    value: barrio.id,
    label: barrio.nombre || 'Sin nombre'
  }));

  // Mostrar errores si hay alguno
  const hasErrors = errorTiposVia || errorSectores || errorBarrios;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
      }}
    >
      {hasErrors && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Algunos datos no se pudieron cargar. Los campos afectados tienen valores por defecto.
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack spacing={2.5}>
          {/* Tipo de Vía */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Tipo de Vía *
            </Typography>
            <Controller
              name="tipoVia"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  options={tipoViaOptions}
                  placeholder="Buscar tipo de vía..."
                  error={errors.tipoVia?.message}
                  disabled={loadingTiposVia || isSubmitting}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          {/* Sector */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Sector *
            </Typography>
            <Controller
              name="codSector"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  options={sectorOptions}
                  placeholder="Seleccione un sector"
                  error={errors.codSector?.message}
                  disabled={loadingSectores || isSubmitting}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          {/* Barrio - Usando Select de MUI */}
          <Box>
            <Controller
              name="codBarrio"
              control={control}
              render={({ field }) => (
                <FormControl 
                  fullWidth 
                  size="small" 
                  error={!!errors.codBarrio}
                >
                  <InputLabel>Barrio *</InputLabel>
                  <Select
                    {...field}
                    label="Barrio *"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('📝 [CalleForm] Barrio seleccionado:', value, 'tipo:', typeof value);
                      field.onChange(value ? Number(value) : '');
                    }}
                  >
                    <MenuItem value="">
                      <em>Seleccione un barrio</em>
                    </MenuItem>
                    {barrioOptions.map((barrio) => (
                      <MenuItem key={barrio.value} value={barrio.value}>
                        {barrio.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.codBarrio && (
                    <FormHelperText error>{errors.codBarrio.message}</FormHelperText>
                  )}
                  <FormHelperText>
                    {barrioOptions.length} barrios disponibles | Seleccionado: {field.value || 'ninguno'}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Nombre de la Calle */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Nombre de la Calle *
            </Typography>
            <TextField
              {...register('nombreCalle')}
              placeholder="Ingrese el nombre de la calle"
              fullWidth
              size="small"
              error={!!errors.nombreCalle}
              helperText={errors.nombreCalle?.message}
              disabled={isSubmitting}
              inputProps={{ maxLength: 100 }}
            />
          </Box>

          {/* Botones de acción */}
          <Stack 
            direction="row" 
            spacing={1.5} 
            justifyContent="space-between"
            sx={{ pt: 1 }}
          >
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNew}
              disabled={isSubmitting}
              size="small"
              sx={{ minWidth: 100 }}
            >
              Nuevo
            </Button>
            
            <Stack direction="row" spacing={1}>
              <Button
                type="button"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
                disabled={isSubmitting}
                size="small"
              >
                Editar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
                size="small"
                sx={{ minWidth: 100 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Guardar'
                )}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

export default CalleForm;