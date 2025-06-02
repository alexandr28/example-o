// src/components/sector/SectorList.tsx - CORREGIDO
import React, { useEffect } from 'react';
import { EntityList } from '../EntityList';
import { Sector } from '../../models/Sector';

interface SectorListProps {
  sectores: Sector[];
  onSelectSector: (sector: Sector) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

const SectorList: React.FC<SectorListProps> = ({ 
  sectores, 
  onSelectSector,
  isOfflineMode = false,
  onEliminar,
  loading = false,
  onSearch,
  searchTerm = ''
}) => {
  // Definir las columnas para la tabla
  const columns = [
    {
      key: 'nombre',
      label: 'Sector',
      sortable: true,
      render: (value: string, sector: Sector) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {value || 'Sin nombre'}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              ID: {sector.id || 'N/A'}
            </div>
          )}
        </div>
      )
    }
  ];
  
  // Log para debug
  useEffect(() => {
    console.log('📊 [SectorList] Estado actual:', {
      sectoresCount: sectores.length,
      loading,
      isOfflineMode,
      primerosItems: sectores.slice(0, 3)
    });
  }, [sectores, loading, isOfflineMode]);

  return (
    <EntityList<Sector>
      title="Lista de sectores"
      items={sectores}
      columns={columns}
      onSelect={onSelectSector}
      onDelete={onEliminar}
      onSearch={onSearch}
      searchPlaceholder="Buscar por nombre de sector"
      loading={loading}
      isOfflineMode={isOfflineMode}
      itemsPerPage={10}
      getItemId={(sector) => sector.id}
      searchTerm={searchTerm}
    />
  );
};

export default SectorList;