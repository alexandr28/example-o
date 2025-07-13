// src/components/barrio/BarrioForm.tsx - VERSIÓN CORREGIDA
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
import { BarrioData } from '../../services/barrioService';
import { SectorData } from '../../services/sectorService';

interface BarrioFormProps {
  barrio?: BarrioData | null;
  sectores: SectorData[];
  onSubmit: (data: any) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
  isEditMode?: boolean;
}

const BarrioFormMUI: FC<BarrioFormProps> = ({
  barrio,
  sectores,
  onSubmit,
  onNuevo,
  onEditar,
  loading = false,
  isEditMode = false
}) => {
  const theme = useTheme();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    sectorId: 0,
    descripcion: ''
  });
  
  const [errors, setErrors] = useState<{
    nombre?: string;
    sectorId?: string;
  }>({});

  // Inicializar con datos si existe barrio seleccionado
  useEffect(() => {
    if (barrio && isEditMode) {
      setFormData({
        nombre: barrio.nombre || '',
        sectorId: barrio.codigoSector || 0,
        descripcion: barrio.descripcion || ''
      });
      setErrors({});
    } else if (!isEditMode) {
      // Limpiar formulario si no es modo edición
      setFormData({
        nombre: '',
        sectorId: 0,
        descripcion: ''
      });
      setErrors({});
    }
  }, [barrio, isEditMode]);

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
  const handleSectorChange = (value: SectorData | null) => {
    setFormData(prev => ({
      ...prev,
      sectorId: value ? value.codigo : 0
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
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.sectorId || formData.sectorId === 0) {
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
  const sectorSeleccionado = sectores.find(s => s.codigo === formData.sectorId);

  // Determinar si el formulario está válido
  const isFormValid = formData.nombre.trim().length > 0 && formData.sectorId > 0;

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
        
        {/* Info del barrio seleccionado */}
        {barrio && !isEditMode && (
          <Stack direction="row" spacing={1}>
            <Chip
              label={`Seleccionado: ${barrio.nombre}`}
              size="small"
              color="info"
              onDelete={onNuevo}
            />
          </Stack>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Selector de Sector */}
          <Autocomplete
            options={sectores}
            getOptionLabel={(option) => option.nombre || ''}
            value={sectorSeleccionado || null}
            onChange={(event, newValue) => handleSectorChange(newValue)}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sector *"
                error={!!errors.sectorId}
                helperText={errors.sectorId}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <LocationCityIcon sx={{ color: 'action.disabled', mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
              />
            )}
          />

          {/* Mostrar sector seleccionado */}
          {sectorSeleccionado && (
            <Alert severity="info" icon={<LocationCityIcon />}>
              <Typography variant="body2">
                Sector seleccionado: <strong>{sectorSeleccionado.nombre}</strong>
              </Typography>
            </Alert>
          )}

          {/* Campo de nombre */}
          <TextField
            name="nombre"
            label="Nombre del Barrio *"
            fullWidth
            value={formData.nombre}
            onChange={handleInputChange}
            error={!!errors.nombre}
            helperText={errors.nombre}
            disabled={loading}
            placeholder="Ingrese el nombre del barrio"
            InputProps={{
              startAdornment: (
                <HomeIcon sx={{ color: 'action.disabled', mr: 1 }} />
              )
            }}
          />

          {/* Debug info en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="caption">
                Debug: Sector ID: {formData.sectorId} | 
                Estado: {isEditMode ? 'Edición' : 'Nuevo'} |
                Modo: Nuevo
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
              disabled={loading || !barrio || isEditMode}
              startIcon={<EditIcon />}
              fullWidth
            >
              Editar
            </Button>

            {/* Botón Guardar */}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !isFormValid}
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
      {loading && (
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