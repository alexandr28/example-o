// src/components/barrio/BarrioForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Autocomplete,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { BarrioFormData } from '../../models/Barrio';
import { useSectores } from '../../hooks/useSectores';

// Esquema de validación con tipo explícito
const schema = yup.object().shape({
  nombre: yup
    .string()
    .trim()
    .required('El nombre del barrio es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .default(''),
  codSector: yup
    .number()
    .positive('Debe seleccionar un sector')
    .integer()
    .required('El sector es requerido')
    .typeError('Debe seleccionar un sector válido')
    .default(0)
});

interface BarrioFormProps {
  onSubmit: (data: BarrioFormData) => void | Promise<void>;
  onCancel?: () => void;
  onNew?: () => void;
  onEdit?: () => void;
  initialData?: Partial<BarrioFormData>;
  isSubmitting?: boolean;
}

const BarrioForm: React.FC<BarrioFormProps> = ({
  onSubmit,
  onCancel,
  onNew,
  onEdit,
  initialData,
  isSubmitting = false
}) => {
  // Hook para obtener sectores
  const { sectores, cargarSectores } = useSectores();
  
  // Configurar react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control
  } = useForm<BarrioFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      codSector: initialData?.codSector || 0
    },
    mode: 'onChange'
  });

  // Cargar sectores al montar
  useEffect(() => {
    cargarSectores();
  }, [cargarSectores]);

  // Observar cambios en el formulario para debug
  const formValues = watch();
  
  useEffect(() => {
    console.log('📝 [BarrioForm] Valores del formulario:', formValues);
  }, [formValues]);

  // Manejar envío del formulario
  const onFormSubmit = async (data: BarrioFormData) => {
    try {
      console.log('📤 [BarrioForm] Enviando datos:', data);
      
      // Asegurar que los datos tengan el formato correcto
      const datosFormateados: BarrioFormData = {
        nombre: data.nombre?.trim() || '',
        codSector: Number(data.codSector) || 0
      };
      
      await onSubmit(datosFormateados);
    } catch (error) {
      console.error('❌ [BarrioForm] Error al enviar:', error);
    }
  };

  const handleNew = () => {
    reset({
      nombre: '',
      codSector: 0
    });
    onNew?.();
  };

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
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Header */}
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
            <HomeIcon />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Formulario de Barrio
          </Typography>
        </Box>

        {sectores.length === 0 && !isSubmitting && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay sectores disponibles. Debe crear un sector primero.
          </Alert>
        )}

        {/* Fila única con todos los campos del formulario */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3,
          alignItems: 'flex-start'
        }}>
          {/* Nombre del Barrio */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <TextField
              {...register('nombre')}
              label="Nombre del Barrio *"
              placeholder="Ingrese el nombre del barrio"
              fullWidth
              size="small"
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              disabled={isSubmitting}
              inputProps={{ maxLength: 100 }}
              sx={{ height: 40 }}
            />
          </Box>

          {/* Sector */}
          <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
            <Controller
              name="codSector"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={sectores || []}
                  getOptionLabel={(option) => option.nombre || 'Sin nombre'}
                  value={sectores?.find(s => s.id === field.value) || null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?.id || 0);
                  }}
                  loading={sectores.length === 0}
                  disabled={isSubmitting || sectores.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sector *"
                      error={!!errors.codSector}
                      helperText={errors.codSector?.message}
                      size="small"
                      placeholder="Seleccione un sector"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {sectores.length === 0 ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>

          {/* Botones en la misma fila */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center',
            flex: '0 0 auto'
          }}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleNew}
              disabled={isSubmitting}
              sx={{ 
                minWidth: 80,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Nuevo
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={onEdit}
              disabled={isSubmitting}
              sx={{ 
                minWidth: 80,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Editar
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={isSubmitting || sectores.length === 0}
              sx={{ 
                minWidth: 100,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={isSubmitting}
                sx={{ 
                  minWidth: 80,
                  height: 40,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default BarrioForm;