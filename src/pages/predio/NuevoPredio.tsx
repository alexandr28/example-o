// src/pages/predio/NuevoPredio.tsx
import React, { FC, useMemo, memo } from 'react';
import { PredioForm, Breadcrumb, NotificationContainer } from '../../components';
import { MainLayout } from '../../layout';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';

/**
 * Página para registrar un nuevo predio
 */
const NuevoPredio: FC = memo(() => {
  // Definir las migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Predio', path: '/predio' },
    { label: 'Registro de predio', active: true }
  ], []);

  return (
    <MainLayout title="Registro de Predio">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Contenedor del formulario */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <PredioForm />
        </div>
      </div>
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer />
    </MainLayout>
  );
});

// Nombre para DevTools
NuevoPredio.displayName = 'NuevoPredio';

export default NuevoPredio;