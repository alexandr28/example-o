// src/pages/mantenedores/VencimientoPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import MainLayout from '../../layout/MainLayout';
import { Vencimiento } from '../../components';

const VencimientoPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Gestion de Vencimientos
        </Typography>
        <Vencimiento />
      </Box>
    </MainLayout>
  );
};

export default VencimientoPage;
