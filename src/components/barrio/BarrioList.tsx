// src/components/barrio/BarrioList.tsx
import React, { useEffect } from 'react';
import { EntityList } from '../EntityList';
import { Barrio } from '../../models/Barrio';

interface BarrioListProps {
  barrios: Barrio[];
  barrioSeleccionado: Barrio | null;
  loading: boolean;
  searchTerm: string;
  isOfflineMode: boolean;
  onSelect: (barrio: Barrio) => void;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

export const BarrioList: React.FC<BarrioListProps> = ({
  barrios,
  barrioSeleccionado,
  loading,
  searchTerm,
  isOfflineMode,
  onSelect,
  onSearch,
  onRefresh
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
            </div>
          )}
        </div>
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
      title="Barrios"
      items={barrios}
      selectedItem={barrioSeleccionado}
      loading={loading}
      searchTerm={searchTerm}
      isOfflineMode={isOfflineMode}
      columns={columns}
      onSelect={onSelect}
      onSearch={onSearch}
      onRefresh={onRefresh}
      searchPlaceholder="Buscar por nombre de barrio..."
      emptyStateTitle="No hay barrios registrados"
      emptyStateDescription="Los barrios aparecerán aquí cuando se agreguen al sistema."
      offlineMessage="Modo sin conexión activo - Mostrando datos locales"
      getItemKey={(barrio) => barrio.id.toString()}
    />
  );
};

export default BarrioList;