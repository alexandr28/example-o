// src/components/coactiva/NuevaResolucionForm.tsx
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
  numeroResolucion: string;
  numeroExpediente: string;
  tipoResolucion: string;
  fechaEmision: string;
  fechaNotificacion: string;
  asunto: string;
  fundamentoLegal: string;
  resuelve: string;
  observaciones: string;
}

const NuevaResolucionForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    numeroResolucion: '',
    numeroExpediente: '',
    tipoResolucion: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaNotificacion: '',
    asunto: '',
    fundamentoLegal: '',
    resuelve: '',
    observaciones: ''
  });

  const [expedienteEncontrado, setExpedienteEncontrado] = useState(false);
  const [datosExpediente, setDatosExpediente] = useState({
    contribuyente: '',
    montoDeuda: '',
    estado: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBuscarExpediente = () => {
    if (!formData.numeroExpediente) {
      NotificationService.warning('Ingrese el número de expediente');
      return;
    }

    NotificationService.info('Buscando expediente...');

    setTimeout(() => {
      setDatosExpediente({
        contribuyente: 'Juan Pérez García',
        montoDeuda: 'S/. 5,450.00',
        estado: 'En Proceso'
      });
      setExpedienteEncontrado(true);
      NotificationService.success('Expediente encontrado');
    }, 1000);
  };

  const handleLimpiar = () => {
    setFormData({
      numeroResolucion: '',
      numeroExpediente: '',
      tipoResolucion: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaNotificacion: '',
      asunto: '',
      fundamentoLegal: '',
      resuelve: '',
      observaciones: ''
    });
    setExpedienteEncontrado(false);
    NotificationService.info('Formulario limpiado');
  };

  const handleGuardar = () => {
    if (!formData.numeroResolucion) {
      NotificationService.error('El número de resolución es requerido');
      return;
    }
    if (!formData.numeroExpediente) {
      NotificationService.error('El número de expediente es requerido');
      return;
    }
    if (!formData.tipoResolucion) {
      NotificationService.error('El tipo de resolución es requerido');
      return;
    }
    if (!formData.asunto) {
      NotificationService.error('El asunto es requerido');
      return;
    }

    NotificationService.success(`Resolución ${formData.numeroResolucion} registrada correctamente`);
    handleLimpiar();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          Complete el formulario para emitir una nueva resolución de cobranza coactiva.
          Todos los campos marcados con (*) son obligatorios.
        </Typography>
      </Alert>

      {/* Datos de la Resolución */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Datos de la Resolución
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Número de Resolución *"
              value={formData.numeroResolucion}
              onChange={(e) => handleInputChange('numeroResolucion', e.target.value)}
              placeholder="Ej: RES-2025-001"
              size="small"
            />

            <TextField
              fullWidth
              label="Tipo de Resolución *"
              select
              value={formData.tipoResolucion}
              onChange={(e) => handleInputChange('tipoResolucion', e.target.value)}
              size="small"
            >
              <MenuItem value="Inicio">Inicio de Procedimiento</MenuItem>
              <MenuItem value="Embargo">Embargo</MenuItem>
              <MenuItem value="Remate">Remate</MenuItem>
              <MenuItem value="Archivo">Archivo</MenuItem>
            </TextField>
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Fecha de Emisión *"
              type="date"
              value={formData.fechaEmision}
              onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Fecha de Notificación"
              type="date"
              value={formData.fechaNotificacion}
              onChange={(e) => handleInputChange('fechaNotificacion', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>
      </FormSection>

      {/* Expediente Relacionado */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Expediente Relacionado
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box display="flex" gap={2}>
            <TextField
              label="Número de Expediente *"
              value={formData.numeroExpediente}
              onChange={(e) => handleInputChange('numeroExpediente', e.target.value)}
              placeholder="EXP-2025-001"
              size="small"
              sx={{ width: 250 }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleBuscarExpediente}
              disabled={!formData.numeroExpediente}
            >
              Buscar Expediente
            </Button>
          </Box>

          {expedienteEncontrado && (
            <InfoCard>
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Información del Expediente
                </Typography>
                <Stack spacing={1} mt={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Contribuyente:</Typography>
                    <Typography variant="body2" fontWeight="medium">{datosExpediente.contribuyente}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Monto Deuda:</Typography>
                    <Typography variant="body2" fontWeight="medium" color="error">{datosExpediente.montoDeuda}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Estado:</Typography>
                    <Typography variant="body2" fontWeight="medium">{datosExpediente.estado}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </InfoCard>
          )}
        </Stack>
      </FormSection>

      {/* Contenido de la Resolución */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Contenido de la Resolución
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Asunto *"
            value={formData.asunto}
            onChange={(e) => handleInputChange('asunto', e.target.value)}
            placeholder="Descripción breve del asunto de la resolución"
            size="small"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Fundamento Legal"
            value={formData.fundamentoLegal}
            onChange={(e) => handleInputChange('fundamentoLegal', e.target.value)}
            placeholder="Base legal que sustenta la resolución..."
            size="small"
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resuelve"
            value={formData.resuelve}
            onChange={(e) => handleInputChange('resuelve', e.target.value)}
            placeholder="Parte resolutiva de la resolución..."
            size="small"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Observaciones adicionales..."
            size="small"
          />
        </Stack>
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
          Guardar Resolución
        </Button>
      </Box>
    </Box>
  );
};

export default NuevaResolucionForm;
