import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import AsignacionCaja from '@/components/caja/AsignacionCaja';
import MainLayout from '@/layout/MainLayout';

const AsignacionCajaPage: React.FC = () => {
  return (
    <MainLayout title="Asignación de Cajeros">
      <Container maxWidth="xl">
        <Box sx={{ my: 3 }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link color="inherit" href="/" underline="hover">
              Inicio
            </Link>
            <Link color="inherit" href="/caja" underline="hover">
              Caja
            </Link>
            <Typography color="text.primary">Asignación de Cajeros</Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Asignación de Cajeros
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Gestione la asignación de cajeros a las diferentes cajas y terminales del sistema
          </Typography>
        </Box>
        
        <AsignacionCaja />
      </Container>
    </MainLayout>
  );
};

export default AsignacionCajaPage;