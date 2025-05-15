import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layout';
import { Breadcrumb,FiltroContribuyenteForm,ContribuyenteList } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useContribuyentes } from '../../hooks';
import { FiltroContribuyente } from '../../models';

/**
 * Página para consultar y listar contribuyentes
 * 
 * Permite buscar contribuyentes por tipo y término de búsqueda,
 * y muestra el resultado en una tabla con paginación.
 */
const ContribuyenteListado: React.FC = () => {
  // Hooks personalizados
  const { 
    contribuyentes, 
    loading, 
    error, 
    buscarContribuyentes 
  } = useContribuyentes();
  
  // Estados locales para el formulario
  const [tipoContribuyente, setTipoContribuyente] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Contribuyente', path: '/contribuyente' },
    { label: 'Consulta contribuyente', active: true }
  ];

  // Manejar cambios en los campos del formulario
  const handleTipoContribuyenteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoContribuyente(e.target.value);
  };

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  // Manejar la búsqueda de contribuyentes
  const handleBuscar = () => {
    const filtro: FiltroContribuyente = {
      tipoContribuyente,
      busqueda
    };
    
    buscarContribuyentes(filtro);
  };

  // Manejar la edición de un contribuyente
  const handleEditar = (codigo: string) => {
    console.log('Redirigir a edición del contribuyente:', codigo);
    // En un caso real, aquí se haría la navegación a la página de edición
    // navigate(`/contribuyente/editar/${codigo}`);
  };

  return (
    <MainLayout title="Consulta de Contribuyentes">
      <div className="space-y-4 p-1">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Mostrar errores si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Filtros de contribuyentes */}
        <FiltroContribuyenteForm
          tipoContribuyente={tipoContribuyente}
          busqueda={busqueda}
          onTipoContribuyenteChange={handleTipoContribuyenteChange}
          onBusquedaChange={handleBusquedaChange}
          onBuscar={handleBuscar}
        />

        {/* Lista de contribuyentes */}
        <ContribuyenteList
          contribuyentes={contribuyentes}
          onEditar={handleEditar}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default ContribuyenteListado;