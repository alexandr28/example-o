// src/components/aranceles/AsignacionArancelForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
  FormHelperText,
  Autocomplete,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAranceles, useArancel } from '../../hooks/useAranceles';
import SelectorDirecciones from '../modal/SelectorDirecciones';

interface ArancelFormData {
  anio: number | null;
  codDireccion: number | null;
  costoArancel: number;
}

export const AsignacionArancelForm: React.FC = () => {
  // Estados
  const [formData, setFormData] = useState<ArancelFormData>({
    anio: null,
    codDireccion: null,
    costoArancel: 0
  });
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<any>(null);
  const [modalDireccionOpen, setModalDireccionOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [codArancelActual, setCodArancelActual] = useState<number | null>(null);

  // Hooks
  const { crearArancel, crearArancelSinAuth, actualizarArancel, obtenerPorAnioYDireccion, loading } = useAranceles();

  // Hook para obtener arancel existente cuando se selecciona año y dirección
  const { arancel: arancelExistente } = useArancel(
    formData.anio || 0,
    formData.codDireccion || 0
  );

  // Efecto para cargar arancel existente
  useEffect(() => {
    if (arancelExistente) {
      setFormData(prev => ({
        ...prev,
        costoArancel: arancelExistente.costoArancel
      }));
      setCodArancelActual(arancelExistente.codArancel);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setCodArancelActual(null);
    }
  }, [arancelExistente]);

  // Generar opciones de años
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    }
    if (!formData.codDireccion) {
      newErrors.direccion = 'La dirección es requerida';
    }
    if (formData.costoArancel < 0) {
      newErrors.costoArancel = 'El costo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleAnioChange = (value: string | number) => {
    setFormData(prev => ({ ...prev, anio: Number(value) }));
    setErrors(prev => ({ ...prev, anio: '' }));
  };

  const handleCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, costoArancel: value }));
    setErrors(prev => ({ ...prev, costoArancel: '' }));
  };

  const handleSelectDireccion = (direccion: any) => {
    setDireccionSeleccionada(direccion);
    setFormData(prev => ({ ...prev, codDireccion: direccion.id || direccion.codDireccion }));
    setErrors(prev => ({ ...prev, direccion: '' }));
    setModalDireccionOpen(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && codArancelActual) {
        // Para actualización, usar el método original
        await actualizarArancel(codArancelActual, {
          anio: formData.anio!,
          codDireccion: formData.codDireccion!,
          costoArancel: formData.costoArancel
        });
      } else {
        // Para creación, usar el nuevo método sin autenticación con JSON
        console.log('📝 [AsignacionArancelForm] Creando arancel sin autenticación');
        await crearArancelSinAuth({
          codArancel: null, // SIEMPRE null - asignado por SQL
          anio: formData.anio!,
          codDireccion: formData.codDireccion!,
          costo: formData.costoArancel, // Usar 'costo' según el DTO
          codUsuario: 1 // Usuario por defecto
        });
      }

      // Limpiar formulario después de guardar exitosamente
      handleNuevo();
    } catch (error) {
      console.error('Error al guardar arancel:', error);
    }
  };

  const handleNuevo = () => {
    setFormData({
      anio: null,
      codDireccion: null,
      costoArancel: 0
    });
    setDireccionSeleccionada(null);
    setIsEditMode(false);
    setCodArancelActual(null);
    setErrors({});
  };

  // Función para formatear la dirección mostrada
  const formatearDireccion = (direccion: any) => {
    if (!direccion) return 'Seleccione una dirección';
    
    const partes = [];
    if (direccion.sector) partes.push(direccion.sector);
    if (direccion.barrio) partes.push(direccion.barrio);
    if (direccion.tipoVia && direccion.nombreVia) {
      partes.push(`${direccion.tipoVia} ${direccion.nombreVia}`);
    }
    if (direccion.cuadra) partes.push(`CUADRA ${direccion.cuadra}`);
    if (direccion.lado) partes.push(`LADO ${direccion.lado}`);
    if (direccion.loteInicial && direccion.loteFinal) {
      partes.push(`LT ${direccion.loteInicial} - ${direccion.loteFinal}`);
    }
    
    return partes.join(' + ');
  };

  const theme = useTheme();

  return (
    <>
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
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
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
          <AssignmentIcon />
        </Box>
        <Typography variant="h6" fontWeight={600}>
          {isEditMode ? 'Editar Arancel' : 'Asignación de Aranceles'}
        </Typography>
      </Box>

      {/* Mostrar estado de edición */}
      {isEditMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ya existe un arancel para esta dirección y año. Puede modificar el costo.
        </Alert>
      )}

      {/* Formulario en una sola fila */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        alignItems: 'center',
        mb: 2
      }}>
        {/* Año */}
        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
          <Autocomplete
            options={yearOptions}
            getOptionLabel={(option) => option.label}
            value={yearOptions.find(y => y.value === formData.anio) || null}
            onChange={(_, newValue) => {
              handleAnioChange(newValue ? newValue.value : '');
            }}
            loading={loading}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Año *"
                size="small"
                placeholder="Seleccione año"
                error={!!errors.anio}
                helperText={errors.anio}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                  sx: { height: 40 }
                }}
              />
            )}
          />
        </Box>

        {/* Costo Arancel */}
        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
          <TextField
            label="Costo Arancel *"
            type="number"
            size="small"
            value={formData.costoArancel}
            onChange={handleCostoChange}
            error={!!errors.costoArancel}
            helperText={errors.costoArancel}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon sx={{ fontSize: 16 }} />
                </InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">S/</InputAdornment>,
              sx: { height: 40 },
              inputProps: { min: 0, step: 0.01 }
            }}
            fullWidth
          />
        </Box>

        {/* Seleccionar Dirección */}
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LocationIcon />}
            onClick={() => setModalDireccionOpen(true)}
            disabled={loading}
            sx={{ 
              height: 40,
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 1,
              width: '100%',
              justifyContent: 'flex-start'
            }}
          >
            Seleccionar Dirección
          </Button>
          {errors.direccion && (
            <FormHelperText error sx={{ ml: 1 }}>
              {errors.direccion}
            </FormHelperText>
          )}
        </Box>

        {/* Botones en la misma fila */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flex: '0 0 auto'
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isEditMode ? 'Actualizar' : 'Guardar'}
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
            disabled={loading}
            sx={{ 
              minWidth: 90,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Nuevo
          </Button>
        </Box>
      </Box>

      {/* Dirección seleccionada */}
      {direccionSeleccionada && (
        <Box sx={{
          p: 2,
          mt: 2,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            Dirección seleccionada:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {formatearDireccion(direccionSeleccionada)}
          </Typography>
        </Box>
      )}
    </Paper>

      {/* Modal de selección de dirección */}
      <SelectorDirecciones
        open={modalDireccionOpen}
        onClose={() => setModalDireccionOpen(false)}
        onSelectDireccion={handleSelectDireccion}
        direccionSeleccionada={direccionSeleccionada}
      />
    </>
  );
};