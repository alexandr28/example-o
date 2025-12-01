// src/pages/coactiva/CoactivaPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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

const MenuCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
}));

interface MenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Expedientes',
    description: 'Gestión de expedientes coactivos',
    icon: <GavelIcon sx={{ fontSize: 48 }} />,
    path: '/coactiva/expedientes',
    color: '#1976d2'
  },
  {
    title: 'Resoluciones',
    description: 'Resoluciones de cobranza coactiva',
    icon: <DescriptionIcon sx={{ fontSize: 48 }} />,
    path: '/coactiva/resoluciones',
    color: '#2e7d32'
  },
  {
    title: 'Notificaciones',
    description: 'Notificaciones a contribuyentes',
    icon: <EmailIcon sx={{ fontSize: 48 }} />,
    path: '/coactiva/notificaciones',
    color: '#ed6c02'
  }
];

const estadisticas = [
  { label: 'Expedientes Activos', valor: '45', color: '#1976d2' },
  { label: 'Resoluciones Vigentes', valor: '28', color: '#2e7d32' },
  { label: 'Notificaciones Pendientes', valor: '12', color: '#ed6c02' },
  { label: 'Monto en Cobranza', valor: 'S/. 285,450', color: '#d32f2f' }
];

const CoactivaPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout title="Cobranza Coactiva">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Cobranza Coactiva
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Sistema de gestión de cobranza coactiva tributaria
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Estadísticas */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} sx={{ mb: 3 }}>
          {estadisticas.map((stat) => (
            <StatsCard key={stat.label}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.valor}
                </Typography>
              </CardContent>
            </StatsCard>
          ))}
        </Box>

        {/* Menú de opciones */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Módulos de Cobranza Coactiva
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={3} mt={2}>
            {menuItems.map((item) => (
              <MenuCard key={item.title}>
                <CardActionArea onClick={() => navigate(item.path)} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ color: item.color, mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </MenuCard>
            ))}
          </Box>
        </Paper>
      </PageContainer>
    </MainLayout>
  );
};

export default CoactivaPage;
