// src/pages/contribuyente/DeduccionBeneficioPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import MainLayout from '../../layout/MainLayout';
import { DeduccionBeneficio } from '../../components';

const DeduccionBeneficioPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Gestion de Deducciones y Beneficios
        </Typography>
        <DeduccionBeneficio />
      </Box>
    </MainLayout>
  );
};

export default DeduccionBeneficioPage;
