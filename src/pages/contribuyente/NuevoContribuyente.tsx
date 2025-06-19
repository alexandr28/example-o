// src/pages/contribuyente/NuevoContribuyente.tsx
import React, { FC, useMemo, memo } from 'react';
import { ContribuyenteForm, Breadcrumb, NotificationContainer } from '../../components';
import { MainLayout } from '../../layout';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';

/**
 * Página para crear un nuevo contribuyente
 * Usa el ContribuyenteForm existente con las APIs integradas
 */
const NuevoContribuyente: FC = memo(() => {
  // Definir las migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Contribuyente', path: '/contribuyente' },
    { label: 'Nuevo contribuyente', active: true }
  ], []);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Contenedor del formulario */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ContribuyenteForm />
        </div>
      </div>
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer />
    </MainLayout>
  );
});

// Nombre para DevTools
NuevoContribuyente.displayName = 'NuevoContribuyente';

export default NuevoContribuyente;