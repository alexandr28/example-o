// src/components/mantenedores/aranceles/AsignacionArancelForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { useAranceles } from '../../hooks/useAranceles';

import SelectorDirecciones from '../modal/SelectorDirecciones';

interface ArancelFormData {
  anio: number | null;
  direccionId: number | null;
  monto: number;
}

export const AsignacionArancelForm: React.FC = () => {
  // Estados
  const [formData, setFormData] = useState<{
    anio: {id: number, value: number, label: string} | null;
    direccionId: number | null;
    monto: number;
  }>({
    anio: null,
    direccionId: null,
    monto: 0
  });
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<any>(null);
  const [modalDireccionOpen, setModalDireccionOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Hooks
  const { crearArancel, actualizarArancel, loading } = useAranceles();

  // Generar opciones de años (últimos 10 años)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    id: currentYear - i,
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    }
    if (!formData.direccionId) {
      newErrors.direccion = 'La dirección es requerida';
    }
    if (formData.monto < 0) {
      newErrors.monto = 'El monto no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleAnioChange = (option: any) => {
    setFormData(prev => ({ ...prev, anio: option }));
    setErrors(prev => ({ ...prev, anio: '' }));
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, monto: value }));
    setErrors(prev => ({ ...prev, monto: '' }));
  };

  const handleSelectDireccion = (direccion: any) => {
    setDireccionSeleccionada(direccion);
    setFormData(prev => ({ ...prev, direccionId: direccion.id }));
    setErrors(prev => ({ ...prev, direccion: '' }));
    setModalDireccionOpen(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && formData.direccionId) {
        await actualizarArancel(formData.direccionId, {
          anio: formData.anio!.value,
          monto: formData.monto
        });
      } else {
        await crearArancel({
          anio: formData.anio!.value,
          direccionId: formData.direccionId!,
          monto: formData.monto
        });
      }

      // Limpiar formulario
      handleNuevo();
    } catch (error) {
      console.error('Error al guardar arancel:', error);
    }
  };

  const handleNuevo = () => {
    setFormData({
      anio: null,
      direccionId: null,
      monto: 0
    });
    setDireccionSeleccionada(null);
    setIsEditMode(false);
    setErrors({});
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Asignación de aranceles
        </Typography>
        
        <Box component="form" noValidate sx={{ mt: 3 }}>
          {/* Fila 1: Año y Monto (compactado a la mitad) */}
          <Box sx={{ maxWidth: '50%', mb: 3 }}>
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <SearchableSelect
                  label="Año"
                  options={yearOptions}
                  value={formData.anio}
                  onChange={handleAnioChange}
                  error={!!errors.anio}
                  helperText={errors.anio}
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Monto"
                  type="number"
                  value={formData.monto}
                  onChange={handleMontoChange}
                  error={!!errors.monto}
                  helperText={errors.monto}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">S/</InputAdornment>
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
                {direccionSeleccionada ? 
                  `${direccionSeleccionada.sector} + ${direccionSeleccionada.barrio} + ${direccionSeleccionada.tipoVia} + ${direccionSeleccionada.nombreVia} + CUADRA ${direccionSeleccionada.cuadra} + LADO ${direccionSeleccionada.lado} + LT ${direccionSeleccionada.loteInicial} - ${direccionSeleccionada.loteFinal}`
                  : 'Seleccione una dirección'
                }
              </Typography>
            </Box>
            {errors.direccion && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.direccion}
              </Typography>
            )}
          </Box>

          {/* Botones de acción */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              Guardar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              disabled={!direccionSeleccionada || loading}
            >
              Editar
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
      />
    </Card>
  );
};