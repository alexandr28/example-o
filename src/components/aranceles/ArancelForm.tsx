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
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Add as AddIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAranceles, useArancel } from '../../hooks/useAranceles';
import SelectorDirecciones from '../modal/SelectorDirecciones';

interface ArancelFormData {
  anio: number | null;
  codDireccion: number | null;
  costoArancel: number;
}

interface AsignacionArancelFormProps {
  onRedirectToList?: (searchParams: { anio: number; codDireccion: number }) => void;
  editData?: any;
}

export const AsignacionArancelForm: React.FC<AsignacionArancelFormProps> = ({ 
  onRedirectToList,
  editData 
}) => {
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
  const { crearArancelSinAuth, actualizarArancelSinAuth, eliminarArancel, loading } = useAranceles();

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

  // Efecto para manejar datos de edición desde la lista
  useEffect(() => {
    if (editData) {
      console.log('✏️ [AsignacionArancelForm] Cargando datos para edición:', editData);
      
      setFormData({
        anio: editData.anio,
        codDireccion: editData.codDireccion,
        costoArancel: editData.costoArancel
      });
      
      setCodArancelActual(editData.codArancel);
      setIsEditMode(true);
      
      // Crear un objeto de dirección temporal para mostrar
      const direccionTemp = {
        id: editData.codDireccion,
        codDireccion: editData.codDireccion,
        sector: `Dirección ${editData.codDireccion}`,
        // Agregar datos mínimos para mostrar
      };
      setDireccionSeleccionada(direccionTemp);
    }
  }, [editData]);


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
    const inputValue = e.target.value;
    // Si el campo está vacío, permitir vacío (no forzar a 0)
    const value = inputValue === '' ? 0 : parseFloat(inputValue);
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
      // Guardar los valores antes de limpiar el formulario para la redirección
      const savedAnio = formData.anio!;
      const savedCodDireccion = formData.codDireccion!;

      if (isEditMode && codArancelActual) {
        // Para actualización, usar el nuevo método PUT sin autenticación con JSON
        console.log('📝 [AsignacionArancelForm] Actualizando arancel sin autenticación');
        await actualizarArancelSinAuth({
          codArancel: codArancelActual,
          anio: formData.anio!,
          codDireccion: formData.codDireccion!,
          costo: formData.costoArancel,
          codUsuario: 1
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

      console.log('✅ [AsignacionArancelForm] Arancel guardado exitosamente');
      
      // Redirigir a la lista con los parámetros de búsqueda precargados
      if (onRedirectToList) {
        console.log('🔄 [AsignacionArancelForm] Redirigiendo a lista con parámetros:', {
          anio: savedAnio,
          codDireccion: savedCodDireccion
        });
        onRedirectToList({
          anio: savedAnio,
          codDireccion: savedCodDireccion
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

  const handleEliminar = async () => {
    if (!codArancelActual) return;

    const confirmDelete = window.confirm('¿Está seguro de que desea eliminar este arancel?');
    if (!confirmDelete) return;

    try {
      console.log('🗑️ [AsignacionArancelForm] Eliminando arancel:', codArancelActual);
      await eliminarArancel(codArancelActual);
      
      // Redirigir a la lista con los parámetros de búsqueda para mostrar el resultado
      if (onRedirectToList && formData.anio && formData.codDireccion) {
        onRedirectToList({
          anio: formData.anio,
          codDireccion: formData.codDireccion
        });
      }
      
      // Limpiar formulario
      handleNuevo();
      
    } catch (error) {
      console.error('❌ [AsignacionArancelForm] Error eliminando arancel:', error);
    }
  };

  // Función para formatear la dirección mostrada
  const formatearDireccion = (direccion: any) => {
    if (!direccion) return 'Seleccione una dirección';

    // Mostrar la descripción completa que viene del API
    if (direccion.descripcion) {
      return direccion.descripcion;
    }

    // Fallback: construir la dirección si no hay descripción
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
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 120px' },
          minWidth: { xs: '100%', md: '120px' }
        }}>
          <TextField
            fullWidth
            size="small"
            label="Año"
            type="number"
            value={formData.anio || ''}
            onChange={(e) => {
              const newYear = parseInt(e.target.value) || '';
              handleAnioChange(newYear);
            }}
            error={!!errors.anio}
            helperText={errors.anio}
            InputProps={{
              inputProps: { 
                min: 1900, 
                max: new Date().getFullYear() 
              }
            }}
          />
        </Box>

        {/* Costo Arancel */}
        <Box sx={{ flex: '0 0 150px', minWidth: '150px' }}>
          <TextField
            label="Costo Arancel *"
            type="number"
            size="small"
            value={formData.costoArancel || ''}
            onChange={handleCostoChange}
            onFocus={(e) => {
              // Al hacer clic, si el valor es 0, limpiar el campo
              if (formData.costoArancel === 0) {
                e.target.select();
              }
            }}
            error={!!errors.costoArancel}
            helperText={errors.costoArancel}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                 S./
                </InputAdornment>
              ),

              sx: { height: 40 },
              inputProps: { min: 0, step: 0.01 }
            }}
            fullWidth
          />
        </Box>

        {/* Seleccionar Dirección */}
        <Box sx={{ flex: '0 0 180px', minWidth: '180px' }}>
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
            color="primary"
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

          {/* Botón Eliminar - Solo visible en modo edición */}
          {isEditMode && codArancelActual && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleEliminar}
              disabled={loading}
              sx={{ 
                minWidth: 100,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: alpha(theme.palette.error.main, 0.04)
                }
              }}
            >
              Eliminar
            </Button>
          )}
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