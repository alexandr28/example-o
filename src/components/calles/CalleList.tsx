// src/components/calles/CalleList.tsx - CORREGIDO
import React, { useEffect } from 'react';
import { EntityList } from '../EntityList';
import { Calle, formatearNombreCalle } from '../../models/Calle';

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
  // Definir las columnas para la tabla
  const columns = [
    {
      key: 'nombre',
      label: 'Calle',
      sortable: true,
      render: (value: string, calle: Calle) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatearNombreCalle(calle)}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              ID: {calle.id || 'N/A'} | Tipo: {calle.tipoVia}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'sectorId',
      label: 'Sector',
      sortable: true,
      render: (sectorId: number, calle: Calle) => (
        <div className="text-sm text-gray-600">
          {obtenerNombreSector ? obtenerNombreSector(sectorId) : `Sector ID: ${sectorId}`}
        </div>
      )
    },
    {
      key: 'barrioId', 
      label: 'Barrio',
      sortable: true,
      render: (barrioId: number, calle: Calle) => (
        <div className="text-sm text-gray-600">
          {obtenerNombreBarrio ? obtenerNombreBarrio(barrioId) : `Barrio ID: ${barrioId}`}
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
    console.log('📊 [CalleList] Estado actual:', {
      callesCount: calles.length,
      loading,
      isOfflineMode,
      primerosItems: calles.slice(0, 3)
    });
  }, [calles, loading, isOfflineMode]);

  return (
    <EntityList<Calle>
      title="Lista de calles"
      items={calles}
      columns={columns}
      onSelect={onSelectCalle}
      onDelete={onEliminar}
      onSearch={onSearch}
      searchPlaceholder="Buscar por nombre de calle"
      loading={loading}
      isOfflineMode={isOfflineMode}
      itemsPerPage={10}
      getItemId={(calle) => calle.id}
      searchTerm={searchTerm}
    />
  );
};

export default CalleList;