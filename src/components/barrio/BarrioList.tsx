// src/components/barrio/BarrioList.tsx - CORREGIDO
import React, { useEffect } from 'react';
import { EntityList } from '../EntityList';
import { Barrio } from '../../models/Barrio';

interface BarrioListProps {
  barrios: Barrio[];
  onSelectBarrio: (barrio: Barrio) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  obtenerNombreSector?: (sectorId: number) => string;
}

const BarrioList: React.FC<BarrioListProps> = ({
  barrios,
  onSelectBarrio,
  isOfflineMode = false,
  onEliminar,
  loading = false,
  onSearch,
  searchTerm = '',
  obtenerNombreSector
}) => {
  // Definir las columnas para la tabla
  const columns = [
    {
      key: 'nombre',
      label: 'Barrio',
      sortable: true,
      render: (value: string, barrio: Barrio) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {value || barrio.nombreBarrio || 'Sin nombre'}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              ID: {barrio.id || 'N/A'} | Código: {barrio.codBarrio || 'N/A'}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'sectorId',
      label: 'Sector',
      sortable: true,
      render: (sectorId: number, barrio: Barrio) => (
        <div className="text-sm text-gray-600">
          {obtenerNombreSector ? obtenerNombreSector(sectorId) : `Sector ID: ${sectorId}`}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (estado: boolean | undefined) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          estado === false 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {estado === false ? 'Inactivo' : 'Activo'}
        </span>
      )
    }
  ];

  // Log para debug
  useEffect(() => {
    console.log('📊 [BarrioList] Estado actual:', {
      barriosCount: barrios.length,
      loading,
      isOfflineMode,
      primerosItems: barrios.slice(0, 3)
    });
  }, [barrios, loading, isOfflineMode]);

  return (
    <EntityList<Barrio>
      title="Lista de barrios"
      items={barrios}
      columns={columns}
      onSelect={onSelectBarrio}
      onDelete={onEliminar}
      onSearch={onSearch}
      searchPlaceholder="Buscar por nombre de barrio"
      loading={loading}
      isOfflineMode={isOfflineMode}
      itemsPerPage={10}
      getItemId={(barrio) => barrio.id}
      searchTerm={searchTerm}
    />
  );
};

export default BarrioList;