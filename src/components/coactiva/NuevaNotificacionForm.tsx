// src/components/coactiva/NuevaNotificacionForm.tsx
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
  numeroNotificacion: string;
  numeroExpediente: string;
  tipoNotificacion: string;
  fechaNotificacion: string;
  fechaEntrega: string;
  direccionNotificacion: string;
  nombreNotificado: string;
  dniNotificado: string;
  medioNotificacion: string;
  observaciones: string;
}

const NuevaNotificacionForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    numeroNotificacion: '',
    numeroExpediente: '',
    tipoNotificacion: '',
    fechaNotificacion: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    direccionNotificacion: '',
    nombreNotificado: '',
    dniNotificado: '',
    medioNotificacion: '',
    observaciones: ''
  });

  const [expedienteEncontrado, setExpedienteEncontrado] = useState(false);
  const [datosExpediente, setDatosExpediente] = useState({
    contribuyente: '',
    direccion: '',
    ultimaResolucion: ''
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
      const datos = {
        contribuyente: 'Juan Pérez García',
        direccion: 'Av. Los Pinos 123, Lima',
        ultimaResolucion: 'RES-2025-001'
      };
      setDatosExpediente(datos);
      setFormData(prev => ({
        ...prev,
        nombreNotificado: datos.contribuyente,
        direccionNotificacion: datos.direccion
      }));
      setExpedienteEncontrado(true);
      NotificationService.success('Expediente encontrado');
    }, 1000);
  };

  const handleLimpiar = () => {
    setFormData({
      numeroNotificacion: '',
      numeroExpediente: '',
      tipoNotificacion: '',
      fechaNotificacion: new Date().toISOString().split('T')[0],
      fechaEntrega: '',
      direccionNotificacion: '',
      nombreNotificado: '',
      dniNotificado: '',
      medioNotificacion: '',
      observaciones: ''
    });
    setExpedienteEncontrado(false);
    NotificationService.info('Formulario limpiado');
  };

  const handleGuardar = () => {
    if (!formData.numeroNotificacion) {
      NotificationService.error('El número de notificación es requerido');
      return;
    }
    if (!formData.numeroExpediente) {
      NotificationService.error('El número de expediente es requerido');
      return;
    }
    if (!formData.tipoNotificacion) {
      NotificationService.error('El tipo de notificación es requerido');
      return;
    }
    if (!formData.direccionNotificacion) {
      NotificationService.error('La dirección de notificación es requerida');
      return;
    }

    NotificationService.success(`Notificación ${formData.numeroNotificacion} registrada correctamente`);
    handleLimpiar();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          Complete el formulario para registrar una nueva notificación de cobranza coactiva.
          Todos los campos marcados con (*) son obligatorios.
        </Typography>
      </Alert>

      {/* Datos de la Notificación */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Datos de la Notificación
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Número de Notificación *"
              value={formData.numeroNotificacion}
              onChange={(e) => handleInputChange('numeroNotificacion', e.target.value)}
              placeholder="Ej: NOT-2025-001"
              size="small"
            />

            <TextField
              fullWidth
              label="Tipo de Notificación *"
              select
              value={formData.tipoNotificacion}
              onChange={(e) => handleInputChange('tipoNotificacion', e.target.value)}
              size="small"
            >
              <MenuItem value="Inicio">Inicio de Procedimiento</MenuItem>
              <MenuItem value="Embargo">Embargo</MenuItem>
              <MenuItem value="Remate">Remate</MenuItem>
              <MenuItem value="Citación">Citación</MenuItem>
            </TextField>
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Fecha de Notificación *"
              type="date"
              value={formData.fechaNotificacion}
              onChange={(e) => handleInputChange('fechaNotificacion', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Medio de Notificación *"
              select
              value={formData.medioNotificacion}
              onChange={(e) => handleInputChange('medioNotificacion', e.target.value)}
              size="small"
            >
              <MenuItem value="Personal">Personal</MenuItem>
              <MenuItem value="Domicilio">Domicilio</MenuItem>
              <MenuItem value="Correo Certificado">Correo Certificado</MenuItem>
              <MenuItem value="Publicación">Publicación</MenuItem>
            </TextField>
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
                    <Typography variant="body2" color="text.secondary">Dirección:</Typography>
                    <Typography variant="body2" fontWeight="medium">{datosExpediente.direccion}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Última Resolución:</Typography>
                    <Typography variant="body2" fontWeight="medium">{datosExpediente.ultimaResolucion}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </InfoCard>
          )}
        </Stack>
      </FormSection>

      {/* Datos del Notificado */}
      <FormSection>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Datos del Notificado
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Nombre del Notificado"
              value={formData.nombreNotificado}
              onChange={(e) => handleInputChange('nombreNotificado', e.target.value)}
              size="small"
            />

            <TextField
              label="DNI del Notificado"
              value={formData.dniNotificado}
              onChange={(e) => handleInputChange('dniNotificado', e.target.value)}
              placeholder="12345678"
              size="small"
              sx={{ width: 200 }}
            />
          </Box>

          <TextField
            fullWidth
            label="Dirección de Notificación *"
            value={formData.direccionNotificacion}
            onChange={(e) => handleInputChange('direccionNotificacion', e.target.value)}
            placeholder="Dirección completa donde se realizará la notificación"
            size="small"
          />

          <TextField
            fullWidth
            label="Fecha de Entrega"
            type="date"
            value={formData.fechaEntrega}
            onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            helperText="Registre esta fecha cuando se confirme la entrega"
          />
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
          placeholder="Ingrese observaciones sobre la notificación..."
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
          Guardar Notificación
        </Button>
      </Box>
    </Box>
  );
};

export default NuevaNotificacionForm;
