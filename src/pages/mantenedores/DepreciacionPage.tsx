import React from 'react';
import { MainLayout } from '../../layout';
import { DepreciacionForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDepreciacion } from '../../hooks/useDepreciacion';

/**
 * Página principal para gestión de Depreciación
 * 
 * Permite registrar y buscar valores de depreciación por año y tipo de casa
 */
const DepreciacionPage: React.FC = () => {
  // Usar el hook personalizado para acceder a toda la lógica de depreciación
  const {
    depreciaciones,
    aniosDisponibles,
    tiposCasa,
    anioSeleccionado,
    tipoCasaSeleccionado,
    paginacion,
    loading,
    error,
    handleAnioChange,
    handleTipoCasaChange,
    registrarDepreciacion,
    buscarDepreciaciones,
    cambiarPagina
  } = useDepreciacion();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Depreciación', active: true }
  ];

  return (
    <MainLayout title="Depreciación">
      <div className="space-y-6 p-1">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Mostrar errores si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Formulario de Depreciación */}
        <DepreciacionForm
          aniosDisponibles={aniosDisponibles}
          tiposCasa={tiposCasa}
          anioSeleccionado={anioSeleccionado}
          tipoCasaSeleccionado={tipoCasaSeleccionado}
          depreciaciones={depreciaciones}
          onAnioChange={handleAnioChange}
          onTipoCasaChange={handleTipoCasaChange}
          onRegistrar={registrarDepreciacion}
          onBuscar={buscarDepreciaciones}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default DepreciacionPage;