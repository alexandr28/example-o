import React, { useEffect, useMemo } from 'react';
import {MainLayout} from '../../layout';
import {Breadcrumb, DireccionForm, DireccionList} from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDirecciones } from '../../hooks/useDirecciones';

/**
 * Página para administrar las direcciones del sistema
 * 
 * Permite añadir, editar, eliminar y buscar direcciones
 * Incluye selección de sector, barrio, calle, cuadra, lado y lotes
 */
const DireccionesPage: React.FC = () => {
  // Usamos el hook personalizado para la gestión de direcciones
  const {
    direcciones,
    sectores,
    barrios,
    barriosFiltrados,
    calles,
    lados,
    direccionSeleccionada,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarDirecciones,
    cargarDependencias,
    seleccionarDireccion,
    handleSectorChange,
    limpiarSeleccion,
    guardarDireccion,
    setModoEdicion
  } = useDirecciones();

  // Cargar datos iniciales
  useEffect(() => {
    cargarDependencias();
    cargarDirecciones();
  }, [cargarDependencias, cargarDirecciones]);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Direcciones', active: true }
  ], []);

  // Manejo de edición
  const handleEditar = () => {
    if (direccionSeleccionada) {
      setModoEdicion(true);
    }
  };

  return (
    <MainLayout title="Mantenimiento de Direcciones">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Mensajes de error, si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Formulario de direcciones */}
        <DireccionForm
          direccionSeleccionada={direccionSeleccionada}
          sectores={sectores}
          barrios={barrios}
          calles={calles}
          lados={lados}
          sectorSeleccionado={sectorSeleccionado}
          onSectorChange={handleSectorChange}
          onGuardar={guardarDireccion}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />
        
        {/* Lista de direcciones */}
        <DireccionList
          direcciones={direcciones}
          onSelectDireccion={seleccionarDireccion}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default DireccionesPage;