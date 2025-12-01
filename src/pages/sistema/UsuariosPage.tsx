// src/pages/sistema/UsuariosPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';
import { UsuariosTable } from '../../components/sistema';
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

const UsuariosPage: React.FC = () => {
  const handleEdit = (usuario: any) => {
    NotificationService.info(`Editar usuario: ${usuario.nombre}`);
  };

  const handleDelete = (usuario: any) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      NotificationService.success(`Usuario ${usuario.nombre} eliminado correctamente`);
    }
  };

  const handleAdd = () => {
    NotificationService.info('Abrir formulario de nuevo usuario');
  };

  return (
    <MainLayout title="Gestión de Usuarios">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PeopleIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestión de Usuarios
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Administración de usuarios del sistema
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Información */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Gestione los usuarios del sistema, asigne roles y controle los accesos.
          </Typography>
        </Alert>

        {/* Tabla de Usuarios */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <UsuariosTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </Paper>
      </PageContainer>
    </MainLayout>
  );
};

export default UsuariosPage;
