// src/pages/sistema/RolesPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';
import { RolesTable } from '../../components/sistema';
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

const RolesPage: React.FC = () => {
  const handleEdit = (rol: any) => {
    NotificationService.info(`Editar rol: ${rol.nombre}`);
  };

  const handleDelete = (rol: any) => {
    if (window.confirm(`¿Está seguro de eliminar el rol ${rol.nombre}?`)) {
      NotificationService.success(`Rol ${rol.nombre} eliminado correctamente`);
    }
  };

  const handleAdd = () => {
    NotificationService.info('Abrir formulario de nuevo rol');
  };

  return (
    <MainLayout title="Gestión de Roles">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestión de Roles
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Administración de roles y permisos del sistema
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Información */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Gestione los roles del sistema y asigne permisos específicos a cada rol.
          </Typography>
        </Alert>

        {/* Tabla de Roles */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <RolesTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </Paper>
      </PageContainer>
    </MainLayout>
  );
};

export default RolesPage;
