import React from 'react';
import { MainLayout } from '../../layout';
import { Breadcrumb,UitForm, UitList } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useUIT } from '../../hooks/useUIT';

/**
 * Página principal para gestión de UIT-EPA
 * 
 * Permite hacer cálculos basados en UIT, ver alícuotas y gestionar la lista de UIT
 */
const UitPage: React.FC = () => {
  // Usar el hook personalizado para acceder a toda la lógica de UIT
  const {
    uits,
    alicuotas,
    aniosDisponibles,
    anioSeleccionado,
    montoCalculo,
    loading,
    error,
    handleAnioChange,
    handleMontoChange,
    calcularImpuesto,
    actualizarAlicuotas
  } = useUIT();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'UIT - EPA', active: true }
  ];

  return (
    <MainLayout title="UIT - EPA">
      <div className="space-y-6 p-1">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Mostrar errores si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Formulario de UIT y Alicuotas */}
        <UitForm
          aniosDisponibles={aniosDisponibles}
          anioSeleccionado={anioSeleccionado}
          montoCalculo={montoCalculo}
          alicuotas={alicuotas}
          onAnioChange={handleAnioChange}
          onMontoChange={handleMontoChange}
          onCalcular={calcularImpuesto}
          onActualizarAlicuotas={actualizarAlicuotas}
          loading={loading}
          editable={true}
        />

        {/* Lista de UIT */}
        <UitList
          uits={uits}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default UitPage;