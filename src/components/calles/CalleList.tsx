// src/components/calles/CalleList.tsx - REFACTORIZADO
import React from 'react';
import { EntityList } from '../EntityList';
import { Calle } from '../../models/';

interface CalleListProps {
  calles: Calle[];
  onSelectCalle: (calle: Calle) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  obtenerNombreSector?: (sectorId: number) => string;
  obtenerNombreBarrio?: (barrioId: number) => string;
}

const CalleList: React.FC<CalleListProps> = ({ 
  calles, 
  onSelectCalle,
  isOfflineMode = false,
  onEliminar,
  loading = false,
  onSearch,
  searchTerm = '',
  obtenerNombreSector,
  obtenerNombreBarrio
}) => {
  // Formatear el tipo de vía
  const formatTipoVia = (tipoVia: string): string => {
    switch (tipoVia?.toLowerCase()) {
      case 'avenida': return 'Av.';
      case 'jiron': return 'Jr.';
      case 'pasaje': return 'Psje.';
      case 'calle': return 'Calle';
      case 'malecon': return 'Malecón';
      case 'plaza': return 'Plaza';
      case 'parque': return 'Parque';
      default: return tipoVia || 'Sin tipo';
    }
  };

  // Definir las columnas para la tabla
  const columns = [
    {
      key: 'ubicacion',
      label: 'Ubicación',
      sortable: true,
      render: (_: any, calle: Calle) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {obtenerNombreSector ? obtenerNombreSector(calle.sectorId) : 
             calle.sector?.nombre || 
             `Sector ${calle.sectorId}`}
          </div>
          <div className="text-gray-500">
            {obtenerNombreBarrio ? obtenerNombreBarrio(calle.barrioId) : 
             calle.barrio?.nombre || 
             `Barrio ${calle.barrioId}`}
          </div>
        </div>
      )
    },
    {
      key: 'tipoVia',
      label: 'Tipo',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900">
            {formatTipoVia(value)}
          </span>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400">({value})</div>
          )}
        </div>
      )
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: string, calle: Calle) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {value || 'Sin nombre'}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              ID: {calle.id || 'N/A'}
              {calle.codTipoVia && ` | Código: ${calle.codTipoVia}`}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'completa',
      label: 'Dirección Completa',
      render: (_: any, calle: Calle) => (
        <div className="text-sm text-gray-900">
          {formatTipoVia(calle.tipoVia)} {calle.nombre}
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
    <EntityList<Calle>
      title="Lista de calles"
      items={calles}
      columns={columns}
      onSelect={onSelectCalle}
      onDelete={onEliminar}
      onSearch={onSearch}
      searchPlaceholder="Buscar por sector, barrio, tipo o nombre de vía"
      loading={loading}
      isOfflineMode={isOfflineMode}
      itemsPerPage={10}
      getItemId={(calle) => calle.id}
      searchTerm={searchTerm}
    />
  );
};

export default CalleList;