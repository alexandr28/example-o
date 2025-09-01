// src/components/calles/CalleForm.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
// import SearchableSelect from '../ui/SearchableSelect';
import { CalleFormData } from '../../models/Calle';
import { useSectores } from '../../hooks/useSectores';
import { useBarrios } from '../../hooks/useBarrios';
import { buildApiUrl } from '../../config/api.unified.config';

// Esquema de validación
const schema = yup.object().shape({
  tipoVia: yup
    .number()
    .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    .required('El tipo de vía es requerido')
    .positive('Debe seleccionar un tipo de vía válido')
    .integer(),
  codSector: yup
    .number()
    .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    .required('El sector es requerido')
    .positive('Debe seleccionar un sector válido')
    .integer(),
  codBarrio: yup
    .number()
    .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    .required('El barrio es requerido')
    .positive('Debe seleccionar un barrio válido')
    .integer(),
  nombreCalle: yup
    .string()
    .trim()
    .required('El nombre de la calle es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

interface CalleFormProps {
  onSubmit: (data: CalleFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onNew?: () => void;
  onUpdateSector?: (sectorId: number, nombre: string) => Promise<boolean>;
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
  onNew,
  onDelete,
  onUpdateSector,
  initialData,
  isSubmitting = false
}) => {
  const [tiposVia, setTiposVia] = useState<TipoViaOption[]>([]);
  const [loadingTiposVia, setLoadingTiposVia] = useState(false);
  const [errorTiposVia, setErrorTiposVia] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditSectorDialog, setOpenEditSectorDialog] = useState(false);
  const [editingSector, setEditingSector] = useState<{id: number, nombre: string} | null>(null);
  const [newSectorName, setNewSectorName] = useState('');
  
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
      tipoVia: initialData?.tipoVia || 0,
      codSector: initialData?.codSector || 0,
      codBarrio: initialData?.codBarrio || 0,
      nombreCalle: initialData?.nombreCalle || '',
    }
  });

  const selectedSector = watch('codSector');

  // Filtrar barrios por sector seleccionado
  const barriosFiltrados = useMemo(() => {
    if (!selectedSector || selectedSector === 0) {
      return [];
    }
    return todosLosBarrios?.filter(barrio => barrio.codSector === selectedSector) || [];
  }, [selectedSector, todosLosBarrios]);

  // Resetear barrio cuando cambia el sector
  useEffect(() => {
    // Solo resetear si no es la carga inicial
    if (selectedSector !== initialData?.codSector) {
      setValue('codBarrio', 0);
    }
  }, [selectedSector, setValue, initialData?.codSector]);

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
    } else {
      // Si no hay datos iniciales, limpiar el formulario
      reset({
        tipoVia: 0,
        codSector: 0,
        codBarrio: 0,
        nombreCalle: ''
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
      
      // Limpiar el formulario después de enviar exitosamente
      reset({
        tipoVia: 0,
        codSector: 0,
        codBarrio: 0,
        nombreCalle: ''
      });
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
    }
  };

  const handleNew = () => {
    reset({
      tipoVia: 0,
      codSector: 0,
      codBarrio: 0,
      nombreCalle: ''
    });
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
      console.error('❌ Error al eliminar:', error);
    }
  };

  // Handlers para editar sector
  const handleEditSector = (sector: any) => {
    setEditingSector({ id: sector.id, nombre: sector.nombre });
    setNewSectorName(sector.nombre);
    setOpenEditSectorDialog(true);
  };

  const handleEditSectorCancel = () => {
    setOpenEditSectorDialog(false);
    setEditingSector(null);
    setNewSectorName('');
  };

  const handleEditSectorConfirm = async () => {
    if (!editingSector || !onUpdateSector || !newSectorName.trim()) return;

    try {
      await onUpdateSector(editingSector.id, newSectorName.trim());
      setOpenEditSectorDialog(false);
      setEditingSector(null);
      setNewSectorName('');
    } catch (error) {
      console.error('❌ Error al actualizar sector:', error);
    }
  };

  // Determinar si el formulario tiene datos iniciales (modo edición)
  const hasInitialData = initialData && (
    initialData.tipoVia || 
    initialData.codSector || 
    initialData.codBarrio || 
    (initialData.nombreCalle && initialData.nombreCalle.trim() !== '')
  );

  // Opciones preparadas para SearchableSelect (actualmente no usado)
  // Se mantienen comentadas por si se necesitan en el futuro
  // const tipoViaOptions = tiposVia.map(tipo => ({
  //   value: tipo.codConstante,
  //   label: tipo.nombre
  // }));
  // const sectorOptions = (sectores || []).map(sector => ({
  //   value: sector.id,
  //   label: sector.nombre || 'Sin nombre'
  // }));
  // const barrioOptions = (todosLosBarrios || []).map(barrio => ({
  //   value: barrio.id,
  //   label: barrio.nombre || 'Sin nombre'
  // }));

  // Mostrar errores si hay alguno
  const hasErrors = errorTiposVia || errorSectores || errorBarrios;

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
      {hasErrors && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Algunos datos no se pudieron cargar. Los campos afectados tienen valores por defecto.
        </Alert>
      )}
      
      
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Primera fila: Todos los campos del formulario en horizontal */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3
        }}>
          {/* Tipo de Vía */}
          <Box sx={{ flex: '1 1 100px', minWidth: '100px' }}>
            <Controller
              name="tipoVia"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={tiposVia}
                  getOptionLabel={(option) => option.nombre || ''}
                  value={tiposVia.find(t => t.codConstante === field.value) || null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?.codConstante || 0);
                  }}
                  loading={loadingTiposVia}
                  disabled={loadingTiposVia || isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Vía *"
                      error={!!errors.tipoVia}
                      helperText={errors.tipoVia?.message}
                      size="small"
                      placeholder="Buscar tipo de vía..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingTiposVia ? <CircularProgress color="inherit" size={20} /> : null}
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

          {/* Sector */}
          <Box sx={{ flex: '1 1 120px', minWidth: '120px' }}>
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
                  loading={loadingSectores}
                  disabled={loadingSectores || isSubmitting}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{option.nombre}</span>
                      {onUpdateSector && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSector(option);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
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
                            {loadingSectores ? <CircularProgress color="inherit" size={20} /> : null}
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

          {/* Barrio */}
          <Box sx={{ flex: '1 1 110px', minWidth: '110px' }}>
            <Controller
              name="codBarrio"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={barriosFiltrados || []}
                  getOptionLabel={(option) => option.nombre || 'Sin nombre'}
                  value={barriosFiltrados?.find(b => b.id === field.value) || null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?.id || 0);
                  }}
                  loading={loadingBarrios}
                  disabled={loadingBarrios || isSubmitting || !selectedSector || selectedSector === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Barrio *"
                      error={!!errors.codBarrio}
                      helperText={
                        !selectedSector || selectedSector === 0 
                          ? "" 
                          : errors.codBarrio?.message || (barriosFiltrados.length === 0 ? "No hay barrios para este sector" : "")
                      }
                      size="small"
                      placeholder={!selectedSector || selectedSector === 0 ? "Primero seleccione un sector" : "Seleccione un barrio"}
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
              )}
            />
          </Box>

          {/* Nombre de la Calle */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <TextField
              {...register('nombreCalle')}
              label="Nombre de la Calle *"
              placeholder="Ingrese el nombre de la calle"
              fullWidth
              size="small"
              error={!!errors.nombreCalle}
              helperText={errors.nombreCalle?.message}
              disabled={isSubmitting}
              inputProps={{ maxLength: 100 }}
            />
          </Box>
        </Box>

        {/* Segunda fila: Botones de acción alineados a la derecha */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          mb: 3
        }}>
           {/* Seccion Buttons */}
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
            type="submit"
            variant="contained"
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (hasInitialData ? <EditIcon /> : <SaveIcon />)}
            disabled={isSubmitting}
            sx={{ 
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isSubmitting 
              ? (hasInitialData ? 'Actualizando...' : 'Guardando...') 
              : (hasInitialData ? 'Actualizar' : 'Guardar')
            }
          </Button>

          {hasInitialData && onDelete && (
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
        
      </form>

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
            ¿Está seguro que desea eliminar esta calle?
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

      {/* Modal de edición de sector */}
      <Dialog
        open={openEditSectorDialog}
        onClose={handleEditSectorCancel}
        maxWidth="sm"
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
            color: 'primary.main'
          }}
        >
          Editar Sector
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Nombre del Sector"
            value={newSectorName}
            onChange={(e) => setNewSectorName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            placeholder="Ingrese el nuevo nombre del sector"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
          <Button 
            onClick={handleEditSectorCancel}
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
            onClick={handleEditSectorConfirm}
            variant="contained"
            color="primary"
            disabled={!newSectorName.trim()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CalleForm;