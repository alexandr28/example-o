// src/pages/sistema/ConfiguracionPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';
import { NotificationService } from '../../components/utils/Notification';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: `0 4px 20px ${theme.palette.primary.main}30`,
}));

const ConfiguracionPage: React.FC = () => {
  const handleGuardar = () => {
    NotificationService.success('Configuración guardada correctamente');
  };

  return (
    <MainLayout title="Configuración del Sistema">
      <PageContainer maxWidth="lg">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SettingsIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Configuración del Sistema
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Parámetros generales del sistema
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Información */}
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Los cambios en la configuración afectarán a todo el sistema.
            Asegúrese de validar los cambios antes de guardar.
          </Typography>
        </Alert>

        {/* Formulario de Configuración */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Configuración General
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Nombre de la Municipalidad"
                defaultValue="Municipalidad Provincial"
                size="small"
              />
              <TextField
                fullWidth
                label="RUC"
                defaultValue="20123456789"
                size="small"
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Dirección"
                defaultValue="Av. Principal 123"
                size="small"
              />
              <TextField
                fullWidth
                label="Teléfono"
                defaultValue="(01) 123-4567"
                size="small"
              />
            </Box>
            <TextField
              fullWidth
              label="Email de Contacto"
              defaultValue="contacto@municipalidad.gob.pe"
              size="small"
              type="email"
            />
          </Stack>
        </Paper>

        {/* Configuración de Seguridad */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Seguridad
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Tiempo de sesión (minutos)"
                defaultValue="30"
                size="small"
                type="number"
              />
              <TextField
                fullWidth
                label="Intentos de login permitidos"
                defaultValue="3"
                size="small"
                type="number"
              />
            </Box>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Requerir contraseña segura"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Habilitar auditoría de acciones"
            />
          </Stack>
        </Paper>

        {/* Configuración de Sistema */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Sistema
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Modo mantenimiento"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Permitir registro de nuevos contribuyentes"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Generar respaldo automático diario"
            />
          </Stack>
        </Paper>

        {/* Botón de Guardar */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="secondary">
            Restablecer
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleGuardar}
          >
            Guardar Configuración
          </Button>
        </Box>
      </PageContainer>
    </MainLayout>
  );
};

export default ConfiguracionPage;
