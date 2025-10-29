// src/pages/mantenedores/escalas/RegistroTIMPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import MainLayout from '../../../layout/MainLayout';
import { RegistroTIM } from '../../../components';

const RegistroTIMPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Registro TIM
        </Typography>
        <RegistroTIM />
      </Box>
    </MainLayout>
  );
};

export default RegistroTIMPage;
