// src/pages/predio/ConsultaAsignacionPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import MainLayout from '../../../layout/MainLayout';
import {ConsultaAsignacion} from '../../../components';

const ConsultaAsignacionPage: React.FC = () => {
  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Módulo', path: '/' },
    { label: 'Predio', path: '/predio' },
    { label: 'Asignación de predios', path: '/predio/asignacion' },
    { label: 'Consulta', active: true }
  ];

  return (
    <MainLayout title="Consulta de Asignaciones">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                
                if (isLast || item.active) {
                  return (
                    <Typography key={item.label} color="text.primary">
                      {item.label}
                    </Typography>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path || '/'}
                    underline="hover"
                    color="inherit"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
          {/* Componente ConsultaAsignacion */}
          <ConsultaAsignacion />
        </Box>
      </Container>

     
    </MainLayout>
  );
};

export default ConsultaAsignacionPage;