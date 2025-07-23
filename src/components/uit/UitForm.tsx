// src/components/uit/UitForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { UITData } from '../../services/uitService';

interface UitFormProps {
  uitSeleccionada: UITData | null;
  onGuardar: (datos: any) => Promise<void>;
  onNuevo: () => void;
  modoEdicion: boolean;
  loading?: boolean;
  anioSeleccionado: number;
  onAnioChange: (anio: number) => void;
}

const UitForm: React.FC<UitFormProps> = ({
  uitSeleccionada,
  onGuardar,
  onNuevo,
  modoEdicion,
  loading = false,
  anioSeleccionado,
  onAnioChange
}) => {
  const [formData, setFormData] = useState({
    anio: anioSeleccionado,
    valor: '',
    monto: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [calculoResultado, setCalculoResultado] = useState<number | null>(null);

  // Generar opciones de años
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + 5 - i);

  // Efecto para cargar datos cuando se selecciona una UIT
  useEffect(() => {
    if (uitSeleccionada && modoEdicion) {
      setFormData({
        anio: uitSeleccionada.anio,
        valor: uitSeleccionada.valor.toString(),
        monto: ''
      });
    } else {
      setFormData({
        anio: anioSeleccionado,
        valor: '',
        monto: ''
      });
    }
    setCalculoResultado(null);
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
    if (field === 'anio') {
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

  // Calcular monto
  const handleCalcular = () => {
    if (formData.monto && formData.valor) {
      const montoIngresado = parseFloat(formData.monto);
      const valorUIT = parseFloat(formData.valor);
      
      if (valorUIT > 0) {
        const resultado = montoIngresado * valorUIT;
        setCalculoResultado(resultado);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* Selección de año */}
        <FormControl fullWidth error={!!errors.anio}>
          <InputLabel>Seleccione el año</InputLabel>
          <Select
            value={formData.anio}
            onChange={(e) => handleChange('anio', e.target.value)}
            label="Seleccione el año"
            disabled={loading || modoEdicion}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
          {errors.anio && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              {errors.anio}
            </Typography>
          )}
        </FormControl>

        {/* Valor UIT */}
        <TextField
          label="Valor UIT"
          type="number"
          value={formData.valor}
          onChange={(e) => handleChange('valor', e.target.value)}
          error={!!errors.valor}
          helperText={errors.valor}
          InputProps={{
            startAdornment: <InputAdornment position="start">S/</InputAdornment>,
            inputProps: { min: 0, step: 0.01 }
          }}
          fullWidth
          required
          disabled={loading}
        />

        {/* Sección de cálculo */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Calculadora UIT
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              label="Monto"
              type="number"
              value={formData.monto}
              onChange={(e) => handleChange('monto', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
              size="small"
              fullWidth
              helperText="Ingrese el monto a calcular"
            />
            
            <Button
              variant="outlined"
              startIcon={<CalculateIcon />}
              onClick={handleCalcular}
              disabled={!formData.monto || !formData.valor}
            >
              Calcular
            </Button>
          </Stack>

          {calculoResultado !== null && (
            <Alert 
              severity="info" 
              icon={<MoneyIcon />}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2">
                <strong>Resultado:</strong> S/ {calculoResultado.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.monto} x S/ {formData.valor} (UIT) = S/ {calculoResultado.toFixed(2)}
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Información del modo */}
        {modoEdicion && (
          <Alert severity="info" variant="outlined">
            Está editando el valor UIT del año {uitSeleccionada?.anio}
          </Alert>
        )}

        {/* Botones de acción */}
        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
            fullWidth
          >
            {modoEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onNuevo}
            disabled={loading}
            fullWidth
          >
            Nuevo
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default UitForm;