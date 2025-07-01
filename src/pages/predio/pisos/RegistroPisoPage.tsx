// src/pages/predio/pisos/RegistroPisoPage.tsx

import React from 'react';
import MainLayout from '../../../layout/MainLayout';
import RegistroPisos from '../../../components/predio/pisos/RegistrosPisos';

/**
 * Página de registro de pisos
 */
const RegistroPisoPage: React.FC = () => {
  return (
    <MainLayout title="Registro de Pisos">
      <RegistroPisos />
    </MainLayout>
  );
};

export default RegistroPisoPage;