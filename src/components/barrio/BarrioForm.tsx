// src/components/barrio/BarrioForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Autocomplete,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { BarrioFormData } from '../../models/Barrio';
import { useSectores } from '../../hooks/useSectores';

// Esquema de validación con tipo explícito
const schema = yup.object().shape({
  nombre: yup
    .string()
    .trim()
    .required('El nombre del barrio es requerido')
    .min(1, 'El nombre debe tener al menos 1 caracter')
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
  onDelete?: () => void | Promise<void>;
  onNew?: () => void;
  initialData?: Partial<BarrioFormData>;
  isSubmitting?: boolean;
}

const BarrioForm: React.FC<BarrioFormProps> = ({
  onSubmit,
  onDelete,
  onNew,
  initialData,
  isSubmitting = false
}) => {
  // Hook para obtener sectores
  const { sectores, cargarSectores } = useSectores();
  
  // Estado para el modal de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Estado para controlar si estamos en modo "nuevo" (independiente de initialData)
  const [isNewMode, setIsNewMode] = useState(!initialData);
  
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

  // Actualizar modo cuando cambien los initialData
  useEffect(() => {
    setIsNewMode(!initialData);
  }, [initialData]);

  // Observar cambios en el formulario para debug
  const formValues = watch();
  
  useEffect(() => {
    console.log('📝 [BarrioForm] Valores del formulario:', formValues);
    console.log('🔍 [BarrioForm] Props debug:', {
      hasOnDelete: !!onDelete,
      hasInitialData: !!initialData,
      initialData: initialData,
      isNewMode: isNewMode,
      shouldShowDeleteButton: !!(onDelete && !isNewMode)
    });
  }, [formValues, onDelete, initialData, isNewMode]);

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
    setIsNewMode(true); // Activar modo "nuevo"
    onNew?.();
  };

  // Handlers para el modal de eliminación
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete?.();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('❌ [BarrioForm] Error al eliminar:', error);
      // El modal se mantiene abierto si hay error
    }
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
       
        

        {sectores.length === 0 && !isSubmitting && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay sectores disponibles. Debe crear un sector primero.
          </Alert>
        )}

        {/* Primera fila con los campos del formulario */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 2,
          alignItems: 'flex-start'
        }}>
          {/* Nombre del Barrio */}
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <TextField
              {...register('nombre')}
              label="Nombre del Barrio *"
              placeholder="Ingrese el nombre del barrio"
              fullWidth
              size="small"
              error={!!errors.nombre}
              helperText={
                errors.nombre?.message || 
                (formValues.nombre?.includes('/') || formValues.nombre?.includes('\\') 
                  ? "Nota: Los caracteres / y \\ serán reemplazados por -" 
                  : "")
              }
              disabled={isSubmitting}
              inputProps={{ maxLength: 100 }}
              sx={{ height: 40 }}
            />
          </Box>

          {/* Sector */}
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Controller
              name="codSector"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={sectores || []}
                  getOptionLabel={(option) => option.nombre || 'Sin nombre'}
                  getOptionKey={(option) => option.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
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
        </Box>

        {/* Segunda fila con los botones */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          alignItems: 'center',
          justifyContent: 'flex-end',
          mb: 3
        }}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNew}
            disabled={isSubmitting}
            sx={{ 
              minWidth: 80,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Nuevo
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (isNewMode ? <SaveIcon /> : <EditIcon />)}
            disabled={isSubmitting || sectores.length === 0}
            sx={{ 
              minWidth: 120,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isSubmitting 
              ? (isNewMode ? 'Guardando...' : 'Actualizando...') 
              : (isNewMode ? 'Guardar' : 'Actualizar')
            }
          </Button>

          {onDelete && !isNewMode && (
            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={isSubmitting}
              sx={{ 
                minWidth: 90,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Eliminar
            </Button>
          )}
        </Box>
      </Box>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'error.main'
          }}
        >
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
            ¿Está seguro que desea eliminar este barrio?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BarrioForm;