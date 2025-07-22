// src/components/aranceles/AsignacionArancelForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Alert,
  CircularProgress,
  FormControl,
  FormHelperText
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { useAranceles, useArancel } from '../../hooks/useAranceles';
import { NotificationService } from '../utils/Notification';
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
  const { crearArancel, actualizarArancel, obtenerPorAnioYDireccion, loading } = useAranceles();

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
        await actualizarArancel(codArancelActual, {
          anio: formData.anio!,
          codDireccion: formData.codDireccion!,
          costoArancel: formData.costoArancel
        });
      } else {
        await crearArancel({
          anio: formData.anio!,
          codDireccion: formData.codDireccion!,
          costoArancel: formData.costoArancel
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

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Editar Arancel' : 'Asignación de Aranceles'}
        </Typography>
        
        <Box component="form" noValidate sx={{ mt: 3 }}>
          {/* Fila 1: Año y Costo */}
          <Box sx={{ maxWidth: '50%', mb: 3 }}>
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }} error={!!errors.anio}>
                <SearchableSelect
                  id="anio-select"
                  name="anio"
                  value={formData.anio || ''}
                  onChange={handleAnioChange}
                  options={yearOptions}
                  placeholder="Seleccione un año"
                  error={errors.anio}
                  required
                  disabled={loading}
                />
                {errors.anio && (
                  <FormHelperText error>{errors.anio}</FormHelperText>
                )}
              </FormControl>
              
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Costo Arancel"
                  type="number"
                  value={formData.costoArancel}
                  onChange={handleCostoChange}
                  error={!!errors.costoArancel}
                  helperText={errors.costoArancel}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Fila 2: Dirección */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Vía
            </Typography>
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2}
              sx={{
                p: 2,
                border: 1,
                borderColor: errors.direccion ? 'error.main' : 'divider',
                borderRadius: 1,
                bgcolor: 'grey.50',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
              onClick={() => setModalDireccionOpen(true)}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
              >
                Seleccionar dirección
              </Button>
              
              <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                {formatearDireccion(direccionSeleccionada)}
              </Typography>
            </Box>
            {errors.direccion && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.direccion}
              </Typography>
            )}
          </Box>

          {/* Mostrar estado de edición */}
          {isEditMode && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Ya existe un arancel para esta dirección y año. Puede modificar el costo.
            </Alert>
          )}

          {/* Botones de acción */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleNuevo}
              disabled={loading}
            >
              Nuevo
            </Button>
          </Box>
        </Box>
      </CardContent>

      {/* Modal de selección de dirección */}
      <SelectorDirecciones
        open={modalDireccionOpen}
        onClose={() => setModalDireccionOpen(false)}
        onSelectDireccion={handleSelectDireccion}
        direccionSeleccionada={direccionSeleccionada}
      />
    </Card>
  );
};