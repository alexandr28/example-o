// src/components/barrio/BarrioList.tsx - versión con debugging mejorado

import React, { useState, useEffect } from 'react';
import { Input, Button } from '../';

interface Sector {
  id?: number;
  nombre: string;
}

interface Barrio {
  id?: number;
  nombre: string;
  sectorId: number;
  sector?: Sector;
}

interface BarrioListProps {
  barrios: Barrio[];
  onSelectBarrio: (barrio: Barrio) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
}

const BarrioList: React.FC<BarrioListProps> = ({ 
  barrios, 
  onSelectBarrio,
  isOfflineMode = false,
  onEliminar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debug: Log cuando cambien los barrios
  useEffect(() => {
    console.log('🏠 BarrioList - Barrios recibidos:', barrios);
    console.log('🔢 BarrioList - Cantidad:', barrios?.length || 0);
    if (barrios && barrios.length > 0) {
      console.log('📋 BarrioList - Primer barrio:', barrios[0]);
    }
  }, [barrios]);

  // Filtrar la lista de barrios según el término de búsqueda
  const filteredBarrios = React.useMemo(() => {
    if (!barrios || !Array.isArray(barrios)) {
      console.warn('⚠️ BarrioList - barrios no es un array válido:', barrios);
      return [];
    }

    const filtered = barrios.filter(barrio => {
      if (!barrio || typeof barrio !== 'object') {
        console.warn('⚠️ BarrioList - barrio inválido:', barrio);
        return false;
      }
      
      if (!barrio.nombre) {
        console.warn('⚠️ BarrioList - barrio sin nombre:', barrio);
        return false;
      }

      if (!searchTerm.trim()) {
        return true;
      }

      return barrio.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    });

    console.log('🔍 BarrioList - Barrios filtrados:', filtered.length);
    return filtered;
  }, [barrios, searchTerm]);

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredBarrios.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarrios.slice(indexOfFirstItem, indexOfLastItem);

  // Debug para los elementos actuales
  useEffect(() => {
    console.log('📄 BarrioList - Elementos en página actual:', currentItems.length);
  }, [currentItems]);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Manejar eliminación de un barrio
  const handleEliminar = (id: number | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (id !== undefined && onEliminar) {
      if (window.confirm('¿Está seguro de eliminar este barrio?')) {
        onEliminar(id);
      }
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          Lista de barrios ({filteredBarrios.length})
        </h2>
        {isOfflineMode && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Modo sin conexión
          </span>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center">
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Buscar por</label>
            </div>
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar por nombre de barrio"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barrio
                  <span className="ml-1">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                  <span className="ml-1">▼</span>
                </th>
                {onEliminar && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((barrio, index) => {
                  console.log(`🏠 Renderizando barrio ${index}:`, barrio);
                  return (
                    <tr
                      key={barrio.id !== undefined ? `barrio-${barrio.id}` : `barrio-index-${index}`}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectBarrio(barrio)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {barrio.nombre || 'Sin nombre'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {barrio.sector?.nombre || `Sector ID: ${barrio.sectorId}` || 'Sin sector'}
                      </td>
                      {onEliminar && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            onClick={(e) => handleEliminar(barrio.id, e)}
                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-md p-1"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={onEliminar ? 3 : 2} className="px-6 py-4 text-center text-sm text-gray-500">
                    {barrios && barrios.length === 0 ? 
                      'No hay barrios disponibles' : 
                      'No se encontraron resultados para la búsqueda'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 text-xs">
            <div>Debug Info:</div>
            <div>- Barrios recibidos: {barrios?.length || 0}</div>
            <div>- Barrios filtrados: {filteredBarrios.length}</div>
            <div>- Elementos en página: {currentItems.length}</div>
            <div>- Término de búsqueda: "{searchTerm}"</div>
          </div>
        )}
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrar de {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredBarrios.length)} de {filteredBarrios.length} datos
            </div>
            <nav className="flex space-x-1">
              <Button
                key="prev-page"
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                className="px-3 py-1 rounded text-gray-500 hover:bg-gray-100"
                disabled={currentPage === 1}
              >
                <span aria-hidden="true">&lt;</span>
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={`page-${pageNum}`}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-gray-200 text-gray-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                key="next-page"
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                className="px-3 py-1 rounded text-gray-500 hover:bg-gray-100"
                disabled={currentPage === totalPages}
              >
                <span aria-hidden="true">&gt;</span>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarrioList;