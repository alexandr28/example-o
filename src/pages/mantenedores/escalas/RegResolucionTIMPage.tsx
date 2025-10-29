// src/pages/mantenedores/escalas/RegResolucionTIMPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import MainLayout from '../../../layout/MainLayout';
import { RegResolucionTIM } from '../../../components';

const RegResolucionTIMPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Registro de Resolución TIM
        </Typography>
        <RegResolucionTIM />
      </Box>
    </MainLayout>
  );
};

export default RegResolucionTIMPage;
