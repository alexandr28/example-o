// src/pages/contribuyente/NuevoContribuyente.tsx
import React, { FC, useMemo, memo, useCallback } from 'react';
import { ContribuyenteForm, Breadcrumb, NotificationContainer } from '../../components';
import { MainLayout } from '../../layout';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import ErrorBoundary from '../../components/utils/ErrorBoundary';
import { useContribuyenteAPI } from '../../hooks/useContribuyenteApi';
import AuthStatusDebug from '../../components/debug/AuthStatusDebug';

/**
 * Error Boundary específico para el formulario de contribuyente
 */
class ContribuyenteFormErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error en ContribuyenteForm:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar el formulario
          </h3>
          <p className="text-sm text-red-600 mb-4">
            Ha ocurrido un error al cargar el formulario de contribuyente.
          </p>
          <details className="text-xs text-red-500">
            <summary className="cursor-pointer">Ver detalles técnicos</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper seguro para el ContribuyenteForm
 * Previene el error de props booleanas en elementos DOM
 */
const SafeContribuyenteFormWrapper: FC = () => {
  const { guardarContribuyente } = useContribuyenteAPI();
  
  const handleSubmit = useCallback(async (formData: any) => {
    try {
      await guardarContribuyente(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }, [guardarContribuyente]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Envolver en un div para aislar cualquier prop problemática */}
      <div>
        <ContribuyenteForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

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
      <ErrorBoundary>
        <div className="space-y-4">
          {/* Navegación de migas de pan */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Contenedor del formulario con Error Boundary específico */}
          <ContribuyenteFormErrorBoundary>
            <SafeContribuyenteFormWrapper />
          </ContribuyenteFormErrorBoundary>
        </div>
        
        {/* Contenedor de notificaciones */}
        <NotificationContainer />
        
        {/* Debug de autenticación (solo en desarrollo) */}
        <AuthStatusDebug />
      </ErrorBoundary>
    </MainLayout>
  );
});

// Nombre para DevTools
NuevoContribuyente.displayName = 'NuevoContribuyente';

export default NuevoContribuyente;