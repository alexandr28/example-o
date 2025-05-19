import React from 'react';
import { MainLayout } from '../../layout';
import { AlcabalaForm,Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useAlcabala } from '../../hooks/useAlcabala';

/**
 * Página principal para gestión de Alcabala
 * 
 * Permite registrar y listar valores de Alcabala
 */
const AlcabalaPage: React.FC = () => {
  // Usar el hook personalizado para acceder a toda la lógica de Alcabala
  const {
    alcabalas,
    aniosDisponibles,
    anioSeleccionado,
    tasaAlcabala,
    paginacion,
    loading,
    error,
    handleAnioChange,
    handleTasaChange,
    registrarAlcabala,
    cambiarPagina
  } = useAlcabala();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Alcabala', active: true }
  ];

  return (
    <MainLayout title="Alcabala">
      <div className="space-y-6 p-1">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Mostrar errores si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Formulario de Alcabala */}
        <AlcabalaForm
          aniosDisponibles={aniosDisponibles}
          anioSeleccionado={anioSeleccionado}
          tasa={tasaAlcabala}
          alcabalas={alcabalas}
          paginacion={paginacion}
          onAnioChange={handleAnioChange}
          onTasaChange={handleTasaChange}
          onRegistrar={registrarAlcabala}
          onCambiarPagina={cambiarPagina}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default AlcabalaPage;