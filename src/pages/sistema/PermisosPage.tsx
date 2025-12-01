// src/pages/sistema/PermisosPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';

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

const ModuloCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
}));

const permisosPorModulo = [
  {
    modulo: 'Contribuyentes',
    permisos: ['Crear', 'Consultar', 'Editar', 'Eliminar', 'Exportar']
  },
  {
    modulo: 'Predios',
    permisos: ['Crear', 'Consultar', 'Editar', 'Eliminar', 'Asignar']
  },
  {
    modulo: 'Caja',
    permisos: ['Apertura', 'Cierre', 'Cobros', 'Movimientos', 'Reportes']
  },
  {
    modulo: 'Cuenta Corriente',
    permisos: ['Consultar', 'Cargo Nuevo', 'Abono Nuevo', 'Reportes']
  },
  {
    modulo: 'Fraccionamiento',
    permisos: ['Solicitud', 'Aprobación', 'Consulta', 'Cronograma']
  },
  {
    modulo: 'Sistema',
    permisos: ['Usuarios', 'Roles', 'Permisos', 'Configuración', 'Auditoría']
  }
];

const PermisosPage: React.FC = () => {
  return (
    <MainLayout title="Gestión de Permisos">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SecurityIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestión de Permisos
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Configuración de permisos por módulo
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Información */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Configure los permisos disponibles para cada módulo del sistema.
          </Typography>
        </Alert>

        {/* Grid de permisos por módulo */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
          {permisosPorModulo.map((item) => (
            <ModuloCard key={item.modulo}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  {item.modulo}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  {item.permisos.map((permiso) => (
                    <FormControlLabel
                      key={permiso}
                      control={<Checkbox defaultChecked />}
                      label={permiso}
                      sx={{ display: 'block', mb: 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </ModuloCard>
          ))}
        </Box>
      </PageContainer>
    </MainLayout>
  );
};

export default PermisosPage;
