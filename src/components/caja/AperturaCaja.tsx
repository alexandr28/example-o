// src/components/caja/AperturaCaja.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '500px',
    maxWidth: '600px',
    overflowX: 'hidden',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(2),
  margin: theme.spacing(-3, -3, 2, -3),
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

// Interfaces
export interface AperturaCajaData {
  numeroCaja: string;
  fechaApertura: string;
  montoInicial: number;
  descripcion: string;
  codUsuario: number;
}

interface AperturaCajaProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AperturaCajaData) => void;
  loading?: boolean;
}

const AperturaCaja: React.FC<AperturaCajaProps> = ({
  open,
  onClose,
  onSave,
  loading = false
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState<AperturaCajaData>({
    numeroCaja: '00013',
    fechaApertura: new Date().toLocaleDateString('es-PE'),
    montoInicial: 1000.0000,
    descripcion: '',
    codUsuario: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numeroCaja.trim()) {
      newErrors.numeroCaja = 'El número de caja es requerido';
    }

    if (!formData.montoInicial || formData.montoInicial <= 0) {
      newErrors.montoInicial = 'El monto inicial debe ser mayor a 0';
    }

    // La descripción es opcional, no se valida

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof AperturaCajaData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar envío
  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setFormData({
      numeroCaja: '',
      fechaApertura: new Date().toLocaleDateString('es-PE'),
      montoInicial: 0,
      descripcion: '',
      codUsuario: 1
    });
    setErrors({});
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Header */}
      <HeaderBox>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCardIcon />
          <Typography variant="h6" fontWeight="bold">
            Monto Apertura Caja
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </HeaderBox>

      <DialogContent sx={{ padding: 3 }}>
        <ContentBox>
          {/* Información de la caja */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef'
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Descripción:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                CAJA N° {formData.numeroCaja}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formData.fechaApertura}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                APERTURA S/. {formData.montoInicial.toFixed(4)}
              </Typography>
            </Box>
          </Paper>

          {/* Formulario */}
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Primera fila: Número de Caja, Fecha de Apertura, Monto Inicio de Caja */}
            <Box display="flex" gap={2}>
              {/* Número de Caja */}
              <TextField
                label="Número de Caja"
                value={formData.numeroCaja}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleInputChange('numeroCaja', value);
                }}
                error={!!errors.numeroCaja}
                helperText={errors.numeroCaja}
                disabled={loading}
                size="small"
                sx={{ flex: 1 }}
                inputProps={{
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
              />

              {/* Fecha de Apertura */}
              <TextField
                label="Fecha de Apertura"
                value={formData.fechaApertura}
                onChange={(e) => handleInputChange('fechaApertura', e.target.value)}
                disabled={loading}
                size="small"
                sx={{ flex: 1 }}
              />

              {/* Monto Inicial */}
              <TextField
                label="Monto Inicio de Caja"
                type="number"
                value={formData.montoInicial}
                onChange={(e) => handleInputChange('montoInicial', parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                error={!!errors.montoInicial}
                helperText={errors.montoInicial}
                disabled={loading}
                size="small"
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                  inputProps: {
                    step: 0.0001,
                    min: 0
                  }
                }}
              />
            </Box>
          </Box>

          {/* Alert informativo */}
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }}
            icon={<CreditCardIcon />}
          >
            <Typography variant="body2">
              Se registrará la apertura de caja con el monto inicial especificado.
              Verifique que todos los datos sean correctos antes de proceder.
            </Typography>
          </Alert>
        </ContentBox>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cerrar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          Grabar
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AperturaCaja;  