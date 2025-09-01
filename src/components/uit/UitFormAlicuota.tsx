// src/components/uit/UitFormAlicuota.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  useTheme,
  alpha,
  Button,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useUIT } from '../../hooks/useUIT';
import { UITData } from '../../services/uitService';

interface UitFormAlicuotaProps {
  uitSeleccionada: UITData | null;
  onGuardar: (datos: any) => Promise<void>;
  onNuevo: () => void;
  onEliminar?: (id: number) => Promise<void>;
  modoEdicion: boolean;
  loading?: boolean;
  anioSeleccionado: number;
  onAnioChange: (anio: number) => void;
}

/**
 * Componente fusionado que incluye formulario UIT y visualización de alícuotas
 */
const UitFormAlicuota: React.FC<UitFormAlicuotaProps> = ({
  uitSeleccionada,
  onGuardar,
  onNuevo,
  onEliminar,
  modoEdicion,
  loading = false,
  anioSeleccionado,
  onAnioChange
}) => {
  const theme = useTheme();
  const { cargarUITs } = useUIT();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    anio: anioSeleccionado || new Date().getFullYear(),
    valor: '',
    monto: ''
  });
  const [errors, setErrors] = useState<any>({});



  // Cargar UITs del año seleccionado
  useEffect(() => {
    if (anioSeleccionado && anioSeleccionado > 0) {
      console.log('🔄 [UitFormAlicuota] Cargando para año:', anioSeleccionado);
      cargarUITs(anioSeleccionado);
    }
  }, [anioSeleccionado, cargarUITs]);

  // Efecto para cargar datos cuando se selecciona una UIT
  useEffect(() => {
    if (uitSeleccionada && modoEdicion) {
      setFormData({
        anio: uitSeleccionada.anio,
        valor: uitSeleccionada.valor.toString(),
        monto: ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        anio: anioSeleccionado
      }));
    }
  }, [uitSeleccionada, modoEdicion, anioSeleccionado]);




  // Validar formulario
  const validarFormulario = () => {
    const newErrors: any = {};

    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'El valor UIT debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Si cambia el año, notificar al padre
    if (field === 'anio' && typeof value === 'number') {
      onAnioChange(value);
    }
  };

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      await onGuardar({
        anio: formData.anio,
        valor: parseFloat(formData.valor)
      });

      // Limpiar formulario después de guardar
      if (!modoEdicion) {
        setFormData({
          anio: anioSeleccionado,
          valor: '',
          monto: ''
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };



  return (
    <Box>
      {/* Formulario UIT */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
    
        <Box component="form" onSubmit={handleSubmit}>
          {/* Formulario en una sola fila */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            alignItems: 'center', // Cambiar a center para alinear todos los elementos
            mb: 2
          }}>
            {/* Selector Año */}
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
                  const anio = parseInt(e.target.value) || null;
                  if (anio) {
                    handleChange('anio', anio);
                  }
                }}
                error={!!errors.anio}
                helperText={errors.anio}
                disabled={loading || modoEdicion}
                InputProps={{
                  inputProps: { 
                    min: 1900, 
                    max: new Date().getFullYear() 
                  }
                }}
              />
            </Box>

            {/* Valor UIT */}
            <Box sx={{ flex: '0 0 100px', minWidth: '150px' }}>
              <TextField
                label="Valor UIT"
                type="number"
                size="small"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                error={!!errors.valor}
                InputProps={{
                  startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                  sx: { height: 32 }
                }}
                fullWidth
                required
                disabled={loading}
              />
            </Box>

            {/* Botones de acción en la misma fila */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flex: '0 0 auto',
              alignItems: 'center' // Alinear verticalmente con el TextField
            }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{ 
                  minWidth: 100,
            
                  height: 32,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onNuevo}
                disabled={loading}
                sx={{ 
                  minWidth: 90,
                  height: 32,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Nuevo
              </Button>

              {/* Botón Eliminar - Solo visible en modo edición */}
              {(() => {
                console.log('🔍 [UitFormAlicuota] Debug botón Eliminar:', {
                  modoEdicion,
                  onEliminar: !!onEliminar,
                  uitSeleccionada: !!uitSeleccionada,
                  uitSeleccionadaId: uitSeleccionada?.id,
                  mostrarBoton: modoEdicion && !!onEliminar && !!uitSeleccionada
                });
                return modoEdicion && onEliminar && uitSeleccionada ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm('¿Está seguro de que desea eliminar esta UIT?')) {
                        onEliminar(uitSeleccionada.id);
                      }
                    }}
                    disabled={loading}
                    sx={{ 
                      minWidth: 100,
                      height: 40,
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
                ) : null;
              })()}
            </Box>
          </Box>

          {/* Errores debajo del formulario */}
          {(errors.anio || errors.valor) && (
            <Box sx={{ mt: 1 }}>
              {errors.anio && (
                <Typography variant="caption" color="error" display="block">
                  {errors.anio}
                </Typography>
              )}
              {errors.valor && (
                <Typography variant="caption" color="error" display="block">
                  {errors.valor}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>

    </Box>
  );
};

export default UitFormAlicuota;