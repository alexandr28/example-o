import React, { useEffect, useMemo } from 'react';
import {MainLayout} from '../../layout';
import {Breadcrumb, ArancelForm, ArancelList} from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useAranceles } from '../../hooks/useAranceles';

/**
 * Página para administrar la asignación de aranceles
 * 
 * Permite añadir, editar, eliminar y buscar aranceles por dirección
 */
const ArancelesPage: React.FC = () => {
  // Usamos el hook personalizado para la gestión de aranceles
  const {
    aranceles,
    direcciones,
    años,
    arancelSeleccionado,
    direccionSeleccionada,
    añoSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarAranceles,
    cargarDirecciones,
    seleccionarArancel,
    seleccionarDireccion,
    handleAñoChange,
    limpiarSeleccion,
    guardarArancel,
    filtrarAranceles,
    setModoEdicion,
  } = useAranceles();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Arancel', path: '/mantenedores/arancel' },
    { label: 'Asignación', active: true }
  ], []);

  // Manejo de edición
  const handleEditar = () => {
    if (arancelSeleccionado) {
      setModoEdicion(true);
    }
  };

  return (
    <MainLayout title="Asignación de Aranceles">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Mensajes de error, si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Formulario de aranceles */}
        <ArancelForm
          arancelSeleccionado={arancelSeleccionado}
          direcciones={direcciones}
          direccionSeleccionada={direccionSeleccionada}
          años={años}
          onGuardar={guardarArancel}
          onSelectDireccion={seleccionarDireccion}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />
        
        {/* Lista de aranceles */}
        <ArancelList
          aranceles={aranceles}
          años={años}
          onSelectArancel={seleccionarArancel}
          onFilter={filtrarAranceles}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default ArancelesPage;