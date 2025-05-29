// src/components/barrio/BarrioList.tsx - REFACTORIZADO
import React from 'react';
import { EntityList } from '../EntityList';
import { Barrio } from '../../models/';

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
            {value || 'Sin nombre'}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              ID: {barrio.id || 'N/A'} 
              {barrio.codBarrio && ` | Código: ${barrio.codBarrio}`}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'sectorId',
      label: 'Sector',
      sortable: true,
      render: (value: number, barrio: Barrio) => (
        <div className="text-sm text-gray-900">
          {obtenerNombreSector ? obtenerNombreSector(value) : 
           barrio.sector?.nombre || 
           `Sector ID: ${value}`}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (value: boolean | undefined) => {
        if (value === undefined) return <span className="text-gray-400">-</span>;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Activo' : 'Inactivo'}
          </span>
        );
      }
    }
  ];

  return (
    <EntityList<Barrio>
      title="Lista de barrios"
      items={barrios}
      columns={columns}
      onSelect={onSelectBarrio}
      onDelete={onEliminar}
      onSearch={onSearch}
      searchPlaceholder="Buscar por nombre de barrio o sector"
      loading={loading}
      isOfflineMode={isOfflineMode}
      itemsPerPage={10}
      getItemId={(barrio) => barrio.id}
      searchTerm={searchTerm}
    />
  );
};

export default BarrioList;