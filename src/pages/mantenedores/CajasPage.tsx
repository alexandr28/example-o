// src/pages/mantenedores/CajaPage.tsx
import React from 'react';
import { Container, Box } from '@mui/material';
import MainLayout from '../../layout/MainLayout';
import Cajas from '../../components/caja/mantenedores/Cajas';

const CajaPage: React.FC = () => {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Cajas />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default CajaPage;
