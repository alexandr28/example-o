// src/pages/sistema/RespaldoPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Backup as BackupIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon
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

const ActionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
}));

// Datos de ejemplo
const respaldosEjemplo = [
  {
    id: 1,
    nombre: 'respaldo_2025-10-31_09-00.sql',
    fecha: '2025-10-31 09:00:00',
    tamaño: '125.4 MB',
    tipo: 'Automático'
  },
  {
    id: 2,
    nombre: 'respaldo_2025-10-30_09-00.sql',
    fecha: '2025-10-30 09:00:00',
    tamaño: '124.8 MB',
    tipo: 'Automático'
  },
  {
    id: 3,
    nombre: 'respaldo_manual_2025-10-29.sql',
    fecha: '2025-10-29 15:30:00',
    tamaño: '123.2 MB',
    tipo: 'Manual'
  }
];

const RespaldoPage: React.FC = () => {
  const [generando, setGenerando] = useState(false);

  const handleGenerarRespaldo = () => {
    setGenerando(true);
    NotificationService.info('Generando respaldo de base de datos...');

    setTimeout(() => {
      setGenerando(false);
      NotificationService.success('Respaldo generado exitosamente');
    }, 3000);
  };

  const handleDescargar = (nombre: string) => {
    NotificationService.info(`Descargando respaldo: ${nombre}`);
  };

  const handleRestaurar = (nombre: string) => {
    if (window.confirm(`¿Está seguro de restaurar el respaldo: ${nombre}?\n\nEsta acción sobrescribirá los datos actuales.`)) {
      NotificationService.warning('Iniciando proceso de restauración...');
    }
  };

  const handleEliminar = (nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar el respaldo: ${nombre}?`)) {
      NotificationService.success('Respaldo eliminado correctamente');
    }
  };

  return (
    <MainLayout title="Respaldo y Restauración">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BackupIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Respaldo y Restauración
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Gestión de copias de seguridad del sistema
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Información */}
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Los respaldos son fundamentales para la seguridad de los datos.
            Se recomienda mantener múltiples copias en ubicaciones diferentes.
          </Typography>
        </Alert>

        {/* Acciones rápidas */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3} sx={{ mb: 3 }}>
          <ActionCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <DownloadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Generar Respaldo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Crear una copia de seguridad manual
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<BackupIcon />}
                onClick={handleGenerarRespaldo}
                disabled={generando}
              >
                {generando ? 'Generando...' : 'Generar Respaldo Ahora'}
              </Button>
              {generando && <LinearProgress sx={{ mt: 2 }} />}
            </CardContent>
          </ActionCard>

          <ActionCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <UploadIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Restaurar desde Archivo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Importar un respaldo externo
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadIcon />}
                component="label"
              >
                Seleccionar Archivo
                <input type="file" hidden accept=".sql" />
              </Button>
            </CardContent>
          </ActionCard>
        </Box>

        {/* Lista de respaldos */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Respaldos Disponibles
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List>
            {respaldosEjemplo.map((respaldo, index) => (
              <React.Fragment key={respaldo.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight="medium">{respaldo.nombre}</Typography>
                        <Chip
                          label={respaldo.tipo}
                          size="small"
                          color={respaldo.tipo === 'Automático' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Fecha: {respaldo.fecha} • Tamaño: {respaldo.tamaño}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="descargar"
                      onClick={() => handleDescargar(respaldo.nombre)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="restaurar"
                      onClick={() => handleRestaurar(respaldo.nombre)}
                      color="success"
                      sx={{ mr: 1 }}
                    >
                      <RestoreIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="eliminar"
                      onClick={() => handleEliminar(respaldo.nombre)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </PageContainer>
    </MainLayout>
  );
};

export default RespaldoPage;
