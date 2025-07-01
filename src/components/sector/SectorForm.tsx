// src/components/sector/SectorForm.tsx - Versión Material-UI
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  CloudOff as CloudOffIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Sector } from '../../models/Sector';

// Schema de validación
const sectorSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre del sector es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface SectorFormProps {
  sectorSeleccionado?: Sector | null;
  onGuardar: (data: { nombre: string }) => void | Promise<void>;
  onNuevo: () => void;
  onEditar: () => void;
  modoOffline?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sectorSeleccionado,
  onGuardar,
  onNuevo,
  onEditar,
  modoOffline = false,
  loading = false,
  isEditMode = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue,
    watch
  } = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: { nombre: '' },
    mode: 'onChange'
  });

  // Observar el valor del nombre
  const nombreValue = watch('nombre');
  
  // Estado para debug
  const [showDebug, setShowDebug] = React.useState(false);

  // Actualizar formulario cuando cambia el sector seleccionado
  useEffect(() => {
    if (sectorSeleccionado) {
      setValue('nombre', sectorSeleccionado.nombre || '');
    } else {
      reset({ nombre: '' });
    }
  }, [sectorSeleccionado, setValue, reset]);

  const onSubmit = async (data: SectorFormData) => {
    try {
      await onGuardar(data);
      if (!isEditMode) {
        reset({ nombre: '' });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleNew = () => {
    reset({ nombre: '' });
    onNuevo();
  };

  const isFormDisabled = loading || (sectorSeleccionado && !isEditMode);

  return (
    <Paper elevation={0} sx={{ overflow: 'hidden', border: 'none' }}>
      {/* Header */}
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        bgcolor: 'transparent',
        borderBottom: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', color: '#374151' }}>
          Datos del Sector
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          {modoOffline && (
            <Chip
              icon={<CloudOffIcon sx={{ fontSize: '0.875rem' }} />}
              label="Sin conexión"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          )}
          
          {sectorSeleccionado && (
            <Chip
              label={`ID: ${sectorSeleccionado.id}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          )}
        </Stack>
      </Box>
      
      {/* Formulario */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, pb: 2 }}>
        <Stack spacing={2}>
          {/* Campo Nombre */}
          <TextField
            {...register('nombre')}
            label="Nombre del Sector"
            placeholder="Ingrese el nombre del sector"
            fullWidth
            size="small"
            error={!!errors.nombre}
            helperText={errors.nombre?.message || `${nombreValue?.length || 0}/100 caracteres`}
            disabled={isFormDisabled}
            required
            InputProps={{
              endAdornment: nombreValue && !isFormDisabled && (
                <Tooltip title="Limpiar">
                  <IconButton
                    size="small"
                    onClick={() => setValue('nombre', '')}
                    edge="end"
                    sx={{ mr: -1 }}
                  >
                    <ClearIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )
            }}
            InputLabelProps={{
              sx: { fontSize: '0.875rem' }
            }}
            sx={{
              '& .MuiInputBase-root': {
                height: 40,
                fontSize: '0.875rem'
              },
              '& .MuiInputBase-input': {
                padding: '8px 12px',
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                marginLeft: 1,
                marginRight: 1,
                marginTop: 0.5
              },
              '& .MuiInputBase-input.Mui-disabled': {
                color: 'text.primary',
                WebkitTextFillColor: 'text.primary',
              }
            }}
          />
          {/* Información adicional */}
          {sectorSeleccionado && !isEditMode && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              Sector registrado - Estado: {sectorSeleccionado.estado ? 'Activo' : 'Inactivo'}
            </Typography>
          )}
        </Stack>
        
        {/* Botones de acción */}
        <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
          {!sectorSeleccionado || isEditMode ? (
            <>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
                disabled={loading || !isDirty || !isValid}
                size="small"
                sx={{
                  minWidth: 100,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  py: 0.75,
                  bgcolor: '#6B7280',
                  '&:hover': {
                    bgcolor: '#4B5563'
                  }
                }}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon sx={{ fontSize: '1rem' }} />}
                onClick={handleNew}
                disabled={loading}
                size="small"
                sx={{
                  minWidth: 100,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  py: 0.75,
                  color: '#10B981',
                  borderColor: '#10B981',
                  '&:hover': {
                    borderColor: '#059669',
                    bgcolor: 'rgba(16, 185, 129, 0.04)'
                  }
                }}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                onClick={handleNew}
                disabled={loading}
                size="small"
                sx={{
                  minWidth: 100,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  py: 0.75,
                  bgcolor: '#10B981',
                  '&:hover': {
                    bgcolor: '#059669'
                  }
                }}
              >
                Nuevo
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
                onClick={onEditar}
                disabled={loading || !sectorSeleccionado}
                size="small"
                sx={{
                  minWidth: 100,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  py: 0.75,
                  color: '#3B82F6',
                  borderColor: '#3B82F6',
                  '&:hover': {
                    borderColor: '#2563EB',
                    bgcolor: 'rgba(59, 130, 246, 0.04)'
                  }
                }}
              >
                Editar
              </Button>
            </>
          )}
        </Stack>
        
        {/* Estado del formulario para desarrollo */}
        {process.env.NODE_ENV === 'development' && showDebug && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
              {JSON.stringify({ 
                isDirty, 
                isValid, 
                isEditMode, 
                hasSelection: !!sectorSeleccionado 
              }, null, 2)}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SectorForm;