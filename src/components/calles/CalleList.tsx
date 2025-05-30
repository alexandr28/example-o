// src/components/calles/CalleList.tsx - REFACTORIZADO
import React,{useEffect} from 'react';
import { EntityList } from '../EntityList';
import { Calle } from '../../models/';

interface CalleListProps {
  calles: Calle[];
  calleSeleccionada: Calle | null;
  loading: boolean;
  searchTerm: string;
  isOfflineMode: boolean;
  onSelect: (calle: Calle) => void;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

const CalleList: React.FC<CalleListProps> = ({ 
   calles,
  calleSeleccionada,
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
      label: 'Calle',
      sortable: true,
      render: (value: string, calle: Calle) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {value || 'Sin nombre'}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              ID: {calle.id || 'N/A'}
            </div>
          )}
        </div>
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
      title="Calles"
      items={calles}
      selectedItem={calleSeleccionada}
      loading={loading}
      searchTerm={searchTerm}
      isOfflineMode={isOfflineMode}
      columns={columns}
      onSelect={onSelect}
      onSearch={onSearch}
      onRefresh={onRefresh}
      searchPlaceholder="Buscar por nombre de calle..."
      emptyStateTitle="No hay calles registradas"
      emptyStateDescription="Las calles aparecerán aquí cuando se agreguen al sistema."
      offlineMessage="Modo sin conexión activo - Mostrando datos locales"
      getItemKey={(calle) => calle.id.toString()}
    />
  );
};

export default CalleList;