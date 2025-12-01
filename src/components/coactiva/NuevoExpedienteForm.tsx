// src/components/coactiva/NuevoExpedienteForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
  Divider,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { NotificationService } from '../utils/Notification';

// Styled Components
const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const InfoCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
}));

interface FormData {
  numeroExpediente: string;
  dniContribuyente: string;
  nombreContribuyente: string;
  direccion: string;
  telefono: string;
  email: string;
  montoDeuda: string;
  tipoDeuda: string;
  observaciones: string;
}

const NuevoExpedienteForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    numeroExpediente: '',
    dniContribuyente: '',
    nombreContribuyente: '',
    direccion: '',
    telefono: '',
    email: '',
    montoDeuda: '',
    tipoDeuda: '',
    observaciones: ''
  });

  const [contribuyenteEncontrado, setContribuyenteEncontrado] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBuscarContribuyente = () => {
    if (!formData.dniContribuyente) {
      NotificationService.warning('Ingrese el DNI del contribuyente');
      return;
    }

    // Simulación de búsqueda
    NotificationService.info('Buscando contribuyente...');

    setTimeout(() => {
      // Simular datos encontrados
      setFormData(prev => ({
        ...prev,
        nombreContribuyente: 'Juan Pérez García',
        direccion: 'Av. Los Pinos 123, Lima',
        telefono: '987654321',
        email: 'juan.perez@email.com'
      }));
      setContribuyenteEncontrado(true);
      NotificationService.success('Contribuyente encontrado');
    }, 1000);
  };

  const handleLimpiar = () => {
    setFormData({
      numeroExpediente: '',
      dniContribuyente: '',
      nombreContribuyente: '',
      direccion: '',
      telefono: '',
      email: '',
      montoDeuda: '',
      tipoDeuda: '',
      observaciones: ''
    });
    setContribuyenteEncontrado(false);
    NotificationService.info('Formulario limpiado');
  };

  const handleGuardar = () => {
    // Validaciones básicas
    if (!formData.numeroExpediente) {
      NotificationService.error('El número de expediente es requerido');
      return;
    }
    if (!formData.dniContribuyente) {
      NotificationService.error('El DNI del contribuyente es requerido');
      return;
    }
    if (!formData.montoDeuda) {
      NotificationService.error('El monto de deuda es requerido');
      return;
    }
    if (!formData.tipoDeuda) {
      NotificationService.error('El tipo de deuda es requerido');
      return;
    }

    // Simulación de guardado
    NotificationService.success(`Expediente ${formData.numeroExpediente} registrado correctamente`);
    handleLimpiar();
  };

  return (
    <Box>
      {/* Información */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          Complete el formulario para registrar un nuevo expediente de cobranza coactiva.
          Todos los campos marcados con (*) son obligatorios.
        </Typography>
      </Alert>

      {/* Datos del Expediente */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Datos del Expediente
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Número de Expediente *"
            value={formData.numeroExpediente}
            onChange={(e) => handleInputChange('numeroExpediente', e.target.value)}
            placeholder="Ej: EXP-2025-001"
            size="small"
          />

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Tipo de Deuda *"
              select
              value={formData.tipoDeuda}
              onChange={(e) => handleInputChange('tipoDeuda', e.target.value)}
              size="small"
            >
              <MenuItem value="predial">Predial</MenuItem>
              <MenuItem value="arbitrios">Arbitrios</MenuItem>
              <MenuItem value="alcabala">Alcabala</MenuItem>
              <MenuItem value="multas">Multas Administrativas</MenuItem>
              <MenuItem value="otros">Otros</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Monto de Deuda (S/.) *"
              type="number"
              value={formData.montoDeuda}
              onChange={(e) => handleInputChange('montoDeuda', e.target.value)}
              placeholder="0.00"
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
            />
          </Box>
        </Stack>
      </FormSection>

      {/* Datos del Contribuyente */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Datos del Contribuyente
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box display="flex" gap={2}>
            <TextField
              label="DNI del Contribuyente *"
              value={formData.dniContribuyente}
              onChange={(e) => handleInputChange('dniContribuyente', e.target.value)}
              placeholder="12345678"
              size="small"
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleBuscarContribuyente}
              disabled={!formData.dniContribuyente}
            >
              Buscar Contribuyente
            </Button>
          </Box>

          {contribuyenteEncontrado && (
            <InfoCard>
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Información del Contribuyente
                </Typography>
                <Stack spacing={2} mt={2}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    value={formData.nombreContribuyente}
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={formData.direccion}
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <Box display="flex" gap={2}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={formData.telefono}
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.email}
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </InfoCard>
          )}
        </Stack>
      </FormSection>

      {/* Observaciones */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Observaciones
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Observaciones"
          value={formData.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          placeholder="Ingrese observaciones adicionales sobre el expediente..."
          size="small"
        />
      </FormSection>

      {/* Botones de acción */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<CancelIcon />}
          onClick={handleLimpiar}
        >
          Limpiar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleGuardar}
        >
          Guardar Expediente
        </Button>
      </Box>
    </Box>
  );
};

export default NuevoExpedienteForm;
