import React, { useEffect, useMemo } from 'react';
import {MainLayout} from '../../layout';
import {BarrioList, BarrioForm,Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useBarrios } from '../../hooks';

/**
 * Página para administrar los barrios del sistema
 * 
 * Permite añadir, editar, eliminar y buscar barrios
 * Requiere seleccionar un sector para cada barrio
 */
const BarriosPage: React.FC = () => {
  // Usamos el hook personalizado para la gestión de barrios
  const {
    barrios,
    sectores,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarBarrios,
    cargarSectores,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    setModoEdicion
  } = useBarrios();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Barrios', active: true }
  ], []);

  // Manejo de edición
  const handleEditar = () => {
    if (barrioSeleccionado) {
      setModoEdicion(true);
    }
  };

  return (
    <MainLayout title="Mantenimiento de Barrios">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Mensajes de error, si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Formulario de barrios */}
        <BarrioForm
          barrioSeleccionado={barrioSeleccionado}
          sectores={sectores}
          onGuardar={guardarBarrio}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />
        
        {/* Lista de barrios */}
        <BarrioList
          barrios={barrios}
          onSelectBarrio={seleccionarBarrio}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default BarriosPage;