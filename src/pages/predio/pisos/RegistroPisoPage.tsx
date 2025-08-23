// src/pages/predio/pisos/RegistroPisoPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Domain as DomainIcon,
  Layers as LayersIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import MainLayout from '../../../layout/MainLayout';
import RegistrosPisos from '../../../components/predio/pisos/RegistrosPisos';

/**
 * Página de registro de pisos con Material-UI
 */
const RegistroPisoPage: React.FC = () => {
  const theme = useTheme();

  // Items del breadcrumb
  const breadcrumbItems = [
    { label: 'Módulo', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Predio', path: '/predio', icon: <DomainIcon sx={{ fontSize: 20 }} /> },
    { label: 'Pisos', path: '/predio/pisos', icon: <LayersIcon sx={{ fontSize: 20 }} /> },
    { label: 'Registro de pisos', active: true, icon: <AddIcon sx={{ fontSize: 20 }} /> }
  ];

  return (
    <MainLayout title="Registro de Pisos">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Breadcrumb mejorado */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                
                if (isLast || item.active) {
                  return (
                    <Chip
                      key={item.label}
                      label={item.label}
                      size="small"
                      icon={item.icon}
                      color="primary"
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          fontSize: 18
                        }
                      }}
                    />
                  );
                }

                return (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path || '/'}
                    underline="hover"
                    color="inherit"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { 
                        color: theme.palette.primary.main 
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

         

          {/* Componente de registro */}
          <RegistrosPisos />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default RegistroPisoPage;