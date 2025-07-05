// src/components/barrio/BarrioFormMUI.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  LocationCity as LocationCityIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { BarrioFormData } from '../../models/Barrio';
import { Sector } from '../../models/Sector';

interface BarrioFormProps {
  barrioSeleccionado?: BarrioFormData | null;
  sectores: Sector[];
  onSubmit: (data: BarrioFormData) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
  loadingSectores?: boolean;
  isEditMode?: boolean;
  isOfflineMode?: boolean;
}

const BarrioFormMUI: FC<BarrioFormProps> = ({
  barrioSeleccionado,
  sectores,
  onSubmit,
  onNuevo,
  onEditar,
  loading = false,
  loadingSectores = false,
  isEditMode = false,
  isOfflineMode = false
}) => {
  const theme = useTheme();
  
  // Estados del formulario
  const [formData, setFormData] = useState<BarrioFormData>({
    nombre: '',
    sectorId: null,
    estado: 1
  });
  
  const [errors, setErrors] = useState<{
    nombre?: string;
    sectorId?: string;
  }>({});

  // Inicializar con datos si es edición
  useEffect(() => {
    if (barrioSeleccionado && isEditMode) {
      setFormData({
        nombre: barrioSeleccionado.nombre || '',
        sectorId: barrioSeleccionado.sectorId || null,
        estado: barrioSeleccionado.estado !== undefined ? barrioSeleccionado.estado : 1
      });
      setErrors({});
    } else {
      // Limpiar formulario
      setFormData({
        nombre: '',
        sectorId: null,
        estado: 1
      });
      setErrors({});
    }
  }, [barrioSeleccionado, isEditMode]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Manejar cambio en el autocomplete de sector
  const handleSectorChange = (value: Sector | null) => {
    setFormData(prev => ({
      ...prev,
      sectorId: value ? value.id : null
    }));
    
    // Limpiar error si había
    if (errors.sectorId) {
      setErrors(prev => ({
        ...prev,
        sectorId: undefined
      }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del barrio es requerido';
    }
    
    if (!formData.sectorId) {
      newErrors.sectorId = 'Debe seleccionar un sector';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('📤 Enviando datos del barrio:', formData);
    onSubmit(formData);
  };

  // Obtener el sector seleccionado
  const sectorSeleccionado = sectores.find(s => s.id === formData.sectorId);

  // Determinar si el formulario está deshabilitado
  const isDisabled = loading || (sectores.length === 0 && !loadingSectores);

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header del formulario */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <HomeIcon color="primary" />
          <Typography variant="h6" component="h2">
            {isEditMode ? 'Editar Barrio' : 'Nuevo Barrio'}
          </Typography>
        </Box>
        
        {/* Chips de estado */}
        <Stack direction="row" spacing={1}>
          {barrioSeleccionado && !isEditMode && (
            <Chip
              label={`Seleccionado: ${barrioSeleccionado.nombre}`}
              size="small"
              color="info"
              onDelete={onNuevo}
            />
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Autocomplete de Sector */}
          <Autocomplete
            id="sector"
            options={sectores}
            getOptionLabel={(option) => option.nombre || ''}
            value={sectorSeleccionado || null}
            onChange={(event, newValue) => handleSectorChange(newValue)}
            disabled={isDisabled || loadingSectores}
            loading={loadingSectores}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sector *"
                error={!!errors.sectorId}
                helperText={errors.sectorId || (sectores.length === 0 && !loadingSectores ? "No hay sectores disponibles" : "")}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <LocationCityIcon 
                        sx={{ 
                          color: 'action.disabled', 
                          mr: 1,
                          ml: 1
                        }} 
                      />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography>{option.nombre}</Typography>
                  {option.estado === false && (
                    <Chip
                      label="Inactivo"
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            noOptionsText="No se encontraron sectores"
            placeholder="Buscar sector..."
          />

          {/* Mostrar información del sector seleccionado */}
          {sectorSeleccionado && (
            <Alert 
              severity="info" 
              icon={<LocationCityIcon />}
              sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography variant="body2">
                <strong>Sector seleccionado:</strong> {sectorSeleccionado.nombre}
              </Typography>
            </Alert>
          )}

          {/* Campo Nombre */}
          <TextField
            fullWidth
            id="nombre"
            name="nombre"
            label="Nombre del Barrio"
            value={formData.nombre}
            onChange={handleInputChange}
            error={!!errors.nombre}
            helperText={errors.nombre}
            disabled={isDisabled}
            required
            placeholder="Ingrese el nombre del barrio"
            InputProps={{
              startAdornment: (
                <HomeIcon 
                  sx={{ 
                    color: 'action.disabled', 
                    mr: 1
                  }} 
                />
              )
            }}
          />

          {/* Debug info en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="caption">
                Debug: Sector ID: {formData.sectorId || 'null'} | 
                Estado: {formData.estado} | 
                Modo: {isEditMode ? 'Edición' : 'Nuevo'}
              </Typography>
            </Alert>
          )}

          {/* Botones de acción */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {/* Botón Nuevo */}
            <Button
              variant="outlined"
              onClick={onNuevo}
              disabled={loading}
              startIcon={<AddIcon />}
              fullWidth
            >
              Nuevo
            </Button>

            {/* Botón Editar */}
            <Button
              variant="outlined"
              onClick={onEditar}
              disabled={loading || !barrioSeleccionado || isEditMode}
              startIcon={<EditIcon />}
              fullWidth
            >
              Editar
            </Button>

            {/* Botón Guardar */}
            <Button
              type="submit"
              variant="contained"
              disabled={isDisabled || !formData.nombre || !formData.sectorId}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              fullWidth
              sx={{
                bgcolor: isEditMode ? 'warning.main' : 'primary.main',
                '&:hover': {
                  bgcolor: isEditMode ? 'warning.dark' : 'primary.dark'
                }
              }}
            >
              {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* Loading overlay */}
      {loadingSectores && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default BarrioFormMUI;