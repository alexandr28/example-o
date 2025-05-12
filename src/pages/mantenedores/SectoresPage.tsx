import React, { useState, useEffect, useMemo } from 'react';
import {MainLayout} from '../../layout';
import {SectorList, SectorForm,Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useSectores } from '../../hooks';


/**
 * Página para administrar los sectores del sistema
 * 
 * Permite añadir, editar, eliminar y buscar sectores
 */
const SectoresPage: React.FC = () => {
  // Usamos el hook personalizado para la gestión de sectores
  const {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    setModoEdicion
  } = useSectores();

  // Cargar sectores al montar el componente
  useEffect(() => {
    cargarSectores();
  }, [cargarSectores]);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Sectores', active: true }
  ], []);

  // Manejo de edición
  const handleEditar = () => {
    if (sectorSeleccionado) {
      setModoEdicion(true);
    }
  };

  return (
    <MainLayout title="Mantenimiento de Sectores">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Mensajes de error, si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Formulario de sectores */}
        <SectorForm
          sectorSeleccionado={sectorSeleccionado}
          onGuardar={guardarSector}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
        />
        
        {/* Lista de sectores con indicador de carga */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <SectorList
            sectores={sectores}
            onSelectSector={seleccionarSector}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default SectoresPage;