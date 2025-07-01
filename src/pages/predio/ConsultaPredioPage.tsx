// src/pages/predio/ConsultaPredioPage.tsx

import React from 'react';
import MainLayout from '../../layout/MainLayout';
import ConsultaPredios from '../../components/predio/ConsultaPredios';
import Breadcrumb from '../../components/utils/Breadcrumb';

/**
 * Página de consulta de predios
 */
const ConsultaPredioPage: React.FC = () => {
  return (
    <MainLayout title="Consulta de Predios">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: 'Inicio', path: '/' },
            { label: 'Predio', path: '/predio' },
            { label: 'Consulta General', path: '/predio/consulta' }
          ]}
        />
      </div>

      {/* Componente de consulta */}
      <ConsultaPredios />
    </MainLayout>
  );
};

export default ConsultaPredioPage;