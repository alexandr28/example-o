// src/components/calles/CalleFormMUI.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Map as MapIcon,
  LocationCity as LocationCityIcon,
  Home as HomeIcon,
  Route as RouteIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { Sector } from '../../models/Sector';
import { Barrio } from '../../models/Barrio';
import { TIPO_VIA_OPTIONS } from '../../models/Calle';

interface CalleFormProps {
  calleSeleccionada?: any;
  sectores: Sector[];
  barrios: Barrio[];
  barriosFiltrados: Barrio[];
  tiposVia: Array<{value: string; descripcion: string}>;
  onSubmit: (data: { sectorId: number; barrioId: number; tipoVia: string; nombre: string }) => void;
  onNuevo: () => void;
  onEditar: () => void;
  onSectorChange: (sectorId: number) => void;
  loading?: boolean;
  loadingSectores?: boolean;
  loadingBarrios?: boolean;
  loadingTiposVia?: boolean;
  isEditMode?: boolean;
}

const CalleFormMUI: FC<CalleFormProps> = ({
  calleSeleccionada,
  sectores,
  barrios,
  barriosFiltrados,
  tiposVia,
  onSubmit,
  onNuevo,
  onEditar,
  onSectorChange,
  loading = false,
  loadingSectores = false,
  loadingBarrios = false,
  loadingTiposVia = false,
  isEditMode = false
}) => {
  const theme = useTheme();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    sectorId: 0,
    barrioId: 0,
    tipoVia: '',
    nombre: ''
  });
  
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<Barrio | null>(null);
  const [selectedTipoVia, setSelectedTipoVia] = useState<any>(null);
  
  const [errors, setErrors] = useState<{
    sectorId?: string;
    barrioId?: string;
    tipoVia?: string;
    nombre?: string;
  }>({});

  // Inicializar con datos si es edición
  useEffect(() => {
    if (calleSeleccionada && isEditMode) {
      setFormData({
        sectorId: calleSeleccionada.sectorId || 0,
        barrioId: calleSeleccionada.barrioId || 0,
        tipoVia: calleSeleccionada.tipoVia || '',
        nombre: calleSeleccionada.nombre || ''
      });
      
      // Establecer objetos seleccionados
      const sector = sectores.find(s => s.id === calleSeleccionada.sectorId);
      const barrio = barrios.find(b => b.id === calleSeleccionada.barrioId);
      const tipo = tiposVia.find(t => t.value === calleSeleccionada.tipoVia);
      
      setSelectedSector(sector || null);
      setSelectedBarrio(barrio || null);
      setSelectedTipoVia(tipo || null);
      
      setErrors({});
    } else {
      // Limpiar formulario
      setFormData({
        sectorId: 0,
        barrioId: 0,
        tipoVia: '',
        nombre: ''
      });
      setSelectedSector(null);
      setSelectedBarrio(null);
      setSelectedTipoVia(null);
      setErrors({});
    }
  }, [calleSeleccionada, isEditMode, sectores, barrios, tiposVia]);

  // Convertir datos para SearchableSelect
  const sectorOptions = sectores.map(s => ({
    ...s,
    label: s.nombre
  }));
  
  const barrioOptions = (barriosFiltrados.length > 0 ? barriosFiltrados : barrios).map(b => ({
    ...b,
    label: b.nombre || b.nombreBarrio || ''
  }));
  
  const tipoViaOptions = (tiposVia.length > 0 ? tiposVia : TIPO_VIA_OPTIONS).map(t => ({
    ...t,
    id: t.value,
    label: t.descripcion
  }));

  // Manejar cambio de sector
  const handleSectorChange = (sector: any) => {
    setSelectedSector(sector);
    setFormData(prev => ({
      ...prev,
      sectorId: sector ? sector.id : 0
    }));
    
    // Limpiar barrio cuando cambia el sector
    setSelectedBarrio(null);
    setFormData(prev => ({
      ...prev,
      barrioId: 0
    }));
    
    // Filtrar barrios si hay función
    if (sector && onSectorChange) {
      onSectorChange(sector.id);
    }
    
    // Limpiar errores
    if (errors.sectorId) {
      setErrors(prev => ({ ...prev, sectorId: undefined }));
    }
  };

  // Manejar cambio de barrio
  const handleBarrioChange = (barrio: any) => {
    setSelectedBarrio(barrio);
    setFormData(prev => ({
      ...prev,
      barrioId: barrio ? barrio.id : 0
    }));
    
    if (errors.barrioId) {
      setErrors(prev => ({ ...prev, barrioId: undefined }));
    }
  };

  // Manejar cambio de tipo de vía
  const handleTipoViaChange = (tipo: any) => {
    setSelectedTipoVia(tipo);
    setFormData(prev => ({
      ...prev,
      tipoVia: tipo ? tipo.value : ''
    }));
    
    if (errors.tipoVia) {
      setErrors(prev => ({ ...prev, tipoVia: undefined }));
    }
  };

  // Manejar cambio en el nombre
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      nombre: value
    }));
    
    if (errors.nombre) {
      setErrors(prev => ({ ...prev, nombre: undefined }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.sectorId) {
      newErrors.sectorId = 'Debe seleccionar un sector';
    }
    
    if (!formData.barrioId) {
      newErrors.barrioId = 'Debe seleccionar un barrio';
    }
    
    if (!formData.tipoVia) {
      newErrors.tipoVia = 'Debe seleccionar un tipo de vía';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la calle es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
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
    
    console.log('📤 Enviando datos de la calle:', formData);
    onSubmit(formData);
  };

  // Determinar si el formulario está deshabilitado
  const isDisabled = loading || 
    (sectores.length === 0 && !loadingSectores) || 
    (barrios.length === 0 && !loadingBarrios);

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
          <MapIcon color="primary" />
          <Typography variant="h6" component="h2">
            {isEditMode ? 'Editar Calle' : 'Nueva Calle'}
          </Typography>
        </Box>
        
        {/* Chips de estado */}
        <Stack direction="row" spacing={1}>
          {calleSeleccionada && !isEditMode && (
            <Chip
              label={`Seleccionada: ${calleSeleccionada.nombre}`}
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
          {/* Select de Tipo de Vía */}
          <SearchableSelect
            id="tipo-via"
            label="Tipo de Vía"
            options={tipoViaOptions}
            value={selectedTipoVia}
            onChange={handleTipoViaChange}
            required
            error={!!errors.tipoVia}
            helperText={errors.tipoVia}
            disabled={isDisabled || loadingTiposVia}
            loading={loadingTiposVia}
            startIcon={<RouteIcon sx={{ color: 'action.disabled' }} />}
            placeholder="Buscar tipo de vía..."
            noOptionsText="No se encontraron tipos de vía"
          />

          {/* Select de Sector */}
          <SearchableSelect
            id="sector"
            label="Sector"
            options={sectorOptions}
            value={selectedSector}
            onChange={handleSectorChange}
            required
            error={!!errors.sectorId}
            helperText={errors.sectorId || (sectores.length === 0 && !loadingSectores ? "No hay sectores disponibles" : "")}
            disabled={isDisabled || loadingSectores}
            loading={loadingSectores}
            startIcon={<LocationCityIcon sx={{ color: 'action.disabled' }} />}
            placeholder="Buscar sector..."
            noOptionsText="No se encontraron sectores"
          />

          {/* Select de Barrio */}
          <SearchableSelect
            id="barrio"
            label="Barrio"
            options={barrioOptions}
            value={selectedBarrio}
            onChange={handleBarrioChange}
            required
            error={!!errors.barrioId}
            helperText={
              errors.barrioId || 
              (!selectedSector ? "Seleccione primero un sector" : "") ||
              (barrios.length === 0 && !loadingBarrios ? "No hay barrios disponibles" : "")
            }
            disabled={isDisabled || loadingBarrios || !selectedSector}
            loading={loadingBarrios}
            startIcon={<HomeIcon sx={{ color: 'action.disabled' }} />}
            placeholder="Buscar barrio..."
            noOptionsText="No se encontraron barrios"
          />

          {/* Mostrar información de ubicación seleccionada */}
          {selectedSector && selectedBarrio && (
            <Alert 
              severity="info" 
              icon={<MapIcon />}
              sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography variant="body2">
                <strong>Ubicación:</strong> {selectedSector.label} - {selectedBarrio.label}
              </Typography>
            </Alert>
          )}

          {/* Campo Nombre */}
          <TextField
            fullWidth
            id="nombre"
            name="nombre"
            label="Nombre de la Calle"
            value={formData.nombre}
            onChange={handleNombreChange}
            error={!!errors.nombre}
            helperText={errors.nombre}
            disabled={isDisabled}
            required
            placeholder="Ingrese el nombre de la calle"
            InputProps={{
              startAdornment: (
                <MapIcon 
                  sx={{ 
                    color: 'action.disabled', 
                    mr: 1
                  }} 
                />
              )
            }}
          />

          {/* Preview del nombre completo */}
          {selectedTipoVia && formData.nombre && (
            <Alert 
              severity="success" 
              sx={{ 
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Typography variant="body2">
                <strong>Nombre completo:</strong> {selectedTipoVia.label} {formData.nombre}
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
              disabled={loading || !calleSeleccionada || isEditMode}
              startIcon={<EditIcon />}
              fullWidth
            >
              Editar
            </Button>

            {/* Botón Guardar */}
            <Button
              type="submit"
              variant="contained"
              disabled={isDisabled || !formData.nombre || !formData.sectorId || !formData.barrioId || !formData.tipoVia}
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
      {(loadingSectores || loadingBarrios || loadingTiposVia) && (
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

export default CalleFormMUI;