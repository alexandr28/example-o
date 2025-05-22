import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../layout';
import { BarrioList, BarrioForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useBarrios } from '../../hooks/useBarrios'; // Importación directa del archivo


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
    searchTerm,
    cargarBarrios,
    cargarSectores,
    buscarBarrios,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    setModoEdicion
  } = useBarrios();

  // Estado local para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    } else {
      setSuccessMessage("Por favor, seleccione un barrio para editar");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Manejo de guardado con confirmación
  const handleGuardar = async (data: { nombre: string, sectorId: number }) => {
    try {
      await guardarBarrio(data);
      setSuccessMessage(modoEdicion 
        ? "Barrio actualizado con éxito" 
        : "Barrio creado con éxito");
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Recargar datos
      await cargarBarrios();
    } catch (error) {
      console.error("Error al guardar barrio:", error);
    }
  };

  // Manejo de eliminación con confirmación
  const handleEliminarBarrio = async (id: number) => {
    try {
      await eliminarBarrio(id);
      setSuccessMessage("Barrio eliminado con éxito");
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Recargar datos
      await cargarBarrios();
    } catch (error) {
      console.error("Error al eliminar barrio:", error);
    }
  };

  // Efecto para cargar datos cuando la página se monta
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Primero cargamos los sectores ya que los barrios dependen de ellos
        await cargarSectores();
        await cargarBarrios();
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };
    
    cargarDatosIniciales();
    console.log('🏘️ BarriosPage - Estado actual:');
    console.log('- Barrios:', barrios?.length || 0, barrios);
    console.log('- Sectores:', sectores?.length || 0, sectores);
    console.log('- Loading:', loading);
    console.log('- Error:', error);
  }, [cargarSectores, cargarBarrios]);

  return (
    <MainLayout title="Mantenimiento de Barrios">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Mensajes de éxito */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md relative" 
               role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        {/* Formulario de barrios */}
        <BarrioForm
          barrioSeleccionado={barrioSeleccionado}
          sectores={sectores}
          onGuardar={handleGuardar}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
          error={error}
        />
        
        {/* Lista de barrios */}
        <BarrioList
          barrios={barrios}
          onSelectBarrio={seleccionarBarrio}
          onDeleteBarrio={handleEliminarBarrio}
          onSearch={buscarBarrios}
          searchTerm={searchTerm}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default BarriosPage;