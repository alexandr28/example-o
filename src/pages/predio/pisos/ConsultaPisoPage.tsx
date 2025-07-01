// src/pages/predio/pisos/ConsultaPisoPage.tsx

import React from 'react';
import MainLayout from '../../../layout/MainLayout';
import ConsultaPisos from '../../../components/predio/pisos/ConsultaPisos';
import Breadcrumb from '../../../components/utils/Breadcrumb';

/**
 * Página de consulta de pisos
 */
const ConsultaPisoPage: React.FC = () => {
  return (
    <MainLayout title="Consulta de Pisos">
      {/* Breadcrumb opcional si quieres uno adicional al del componente */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: 'Inicio', path: '/' },
            { label: 'Predio', path: '/predio' },
            { label: 'Pisos', path: '/predio/pisos' },
            { label: 'Consulta', path: '/predio/pisos/consulta' }
          ]}
        />
      </div>

      {/* Componente de consulta */}
      <ConsultaPisos />
    </MainLayout>
  );
};

export default ConsultaPisoPage;