import React, { useEffect } from 'react';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDirecciones } from '../../hooks/useDirecciones';
import DireccionFormMUI from '../../components/direcciones/DireccionForm';
import DireccionListMUI from '../../components/direcciones/DireccionList';
import { Box, Stack } from '@mui/material';

/**
 * Página para gestionar las direcciones del sistema
 * Usa componentes DireccionForm y DireccionList con Material UI
 */
const DireccionesPage: React.FC = () => {
  // Hook simplificado que solo usa el servicio de direcciones
  const {
    direcciones,
    direccionSeleccionada,
    loading,
    error,
    cargarDirecciones,
    seleccionarDireccion,
    limpiarSeleccion,
    buscarPorNombreVia
  } = useDirecciones();

  // Cargar direcciones al montar
  useEffect(() => {
    cargarDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Direcciones', active: true }
  ];

  return (
    <MainLayout title="Gestión de Direcciones">
      <Box sx={{ p: 3 }}>
        {/* Navegación */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>
        
        {/* Contenido principal */}
        <Stack spacing={3}>
          {/* Formulario de búsqueda */}
          <DireccionFormMUI
            direccionSeleccionada={direccionSeleccionada}
            onBuscar={buscarPorNombreVia}
            onLimpiar={limpiarSeleccion}
            onRecargar={cargarDirecciones}
            loading={loading}
            error={error}
          />
          
          {/* Lista de direcciones */}
          <DireccionListMUI
            direcciones={direcciones}
            direccionSeleccionada={direccionSeleccionada}
            onSelectDireccion={seleccionarDireccion}
            loading={loading}
          />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default DireccionesPage;