// src/components/calles/CalleList.tsx - CORREGIDO CON KEYS ÚNICAS
import React, { useState, useEffect } from 'react';
import { Input, Button } from '../';
import { Calle } from '../../models';

interface CalleListProps {
  calles: Calle[];
  onSelectCalle: (calle: Calle) => void;
  onSearch: (term: string) => void;
  loading?: boolean;
  searchTerm: string;
  onDeleteCalle?: (id: number) => void;
}

const CalleList: React.FC<CalleListProps> = ({ 
  calles, 
  onSelectCalle,
  onSearch,
  loading = false,
  searchTerm,
  onDeleteCalle
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Actualizar término de búsqueda local cuando cambia el prop
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debug: Log para detectar problemas de keys
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && calles.length > 0) {
      // Verificar IDs duplicados
      const ids = calles.map(c => c.id).filter(id => id !== undefined);
      const idsUnicos = new Set(ids);
      
      if (ids.length !== idsUnicos.size) {
        console.warn('⚠️ [CalleList] IDs duplicados detectados:', {
          totalCalles: calles.length,
          idsUnicos: idsUnicos.size,
          duplicados: ids.filter((id, index) => ids.indexOf(id) !== index)
        });
        
        // Mostrar calles con IDs duplicados
        const duplicatedIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        duplicatedIds.forEach(dupId => {
          const callesToDup = calles.filter(c => c.id === dupId);
          console.warn(`🔍 [CalleList] Calles con ID ${dupId}:`, callesToDup);
        });
      }
    }
  }, [calles]);

  // Formatear el tipo de vía de manera segura
  const formatTipoVia = (tipoVia: string | undefined | null): string => {
    if (tipoVia === undefined || tipoVia === null) {
      return 'Sin tipo';
    }
    
    switch (tipoVia.toLowerCase()) {
      case 'avenida': return 'Av.';
      case 'jiron': return 'Jr.';
      case 'pasaje': return 'Psje.';
      case 'calle': return 'Calle';
      case 'malecon': return 'Malecón';
      case 'plaza': return 'Plaza';
      case 'parque': return 'Parque';
      default: return tipoVia;
    }
  };

  // Filtrar las calles de manera segura
  const filteredCalles = calles
    .filter(calle => {
      if (!calle || typeof calle !== 'object') {
        console.warn('⚠️ [CalleList] Calle inválida encontrada:', calle);
        return false;
      }
      return true;
    })
    .filter(calle => {
      if (!localSearchTerm) return true;
      
      const searchTermLower = localSearchTerm.toLowerCase();
      
      const nombreMatch = calle.nombre 
        ? calle.nombre.toLowerCase().includes(searchTermLower) 
        : false;
      
      const tipoViaMatch = calle.tipoVia 
        ? calle.tipoVia.toLowerCase().includes(searchTermLower) 
        : false;
      
      return nombreMatch || tipoViaMatch;
    });

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredCalles.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCalles.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Manejar búsqueda
  const handleSearch = () => {
    onSearch(localSearchTerm);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Manejar eliminación de manera segura
  const handleDelete = (e: React.MouseEvent, id: number | undefined) => {
    e.stopPropagation();
    
    if (id === undefined) {
      console.warn('⚠️ [CalleList] Intentando eliminar una calle sin ID');
      return;
    }
    
    if (onDeleteCalle) {
      if (window.confirm('¿Está seguro de eliminar esta calle?')) {
        onDeleteCalle(id);
      }
    }
  };

  // Función para generar key única de manera segura
  const generateUniqueKey = (calle: Calle, index: number): string => {
    // Prioridad 1: Usar ID si existe y es único
    if (calle.id !== undefined && calle.id !== null) {
      return `calle-id-${calle.id}`;
    }
    
    // Prioridad 2: Combinar nombre + tipo + índice para evitar duplicados
    const nombre = calle.nombre || 'sin-nombre';
    const tipo = calle.tipoVia || 'sin-tipo';
    return `calle-${tipo}-${nombre}-${index}`.replace(/\s+/g, '-').toLowerCase();
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Lista de calles</h2>
        
        <div className="text-sm text-gray-500">
          {filteredCalles.length} {filteredCalles.length === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center">
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Buscar por</label>
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                <Input
                  placeholder="Buscar por nombre o tipo de vía"
                  value={localSearchTerm}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="rounded-r-none flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Vía
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((calle, index) => {
                    // Generar key única para evitar duplicados
                    const uniqueKey = generateUniqueKey(calle, indexOfFirstItem + index);
                    
                    return (
                      <tr
                        key={uniqueKey}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => onSelectCalle(calle)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {formatTipoVia(calle.tipoVia)}
                            </span>
                            {process.env.NODE_ENV === 'development' && (
                              <span className="ml-2 text-xs text-gray-400">
                                ({calle.tipoVia})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {calle.nombre || 'Sin nombre'}
                            </div>
                            {process.env.NODE_ENV === 'development' && (
                              <div className="text-xs text-gray-500">
                                ID: {calle.id || 'N/A'} | Key: {uniqueKey}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-2 py-1 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCalle(calle);
                              }}
                              title="Editar calle"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            {onDeleteCalle && calle.id !== undefined && (
                              <button
                                className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-md px-2 py-1 transition-colors"
                                onClick={(e) => handleDelete(e, calle.id)}
                                title="Eliminar calle"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      {calles.length === 0 
                        ? 'No hay calles disponibles' 
                        : 'No se encontraron resultados para la búsqueda'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Debug info en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <div className="font-semibold mb-1">🔧 Debug Info:</div>
            <div>📊 Calles recibidas: {calles.length}</div>
            <div>✅ Calles filtradas: {filteredCalles.length}</div>
            <div>📄 En página actual: {currentItems.length}</div>
            <div>🔍 Término búsqueda: "{localSearchTerm}"</div>
            <div>🔑 Keys únicas: {currentItems.every((_, i) => currentItems.findIndex((c, j) => generateUniqueKey(c, j) === generateUniqueKey(currentItems[i], i)) === i) ? 'Sí' : 'No'}</div>
            {calles.length > 0 && (
              <div>🎯 Primera calle: {calles[0]?.nombre || 'Sin nombre'} (ID: {calles[0]?.id || 'N/A'})</div>
            )}
          </div>
        )}
        
        {/* Paginación mejorada con keys únicas */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredCalles.length)} de {filteredCalles.length} resultados
            </div>
            <nav className="flex space-x-1">
              {currentPage > 1 && (
                <Button
                  key="prev-btn"
                  onClick={() => paginate(currentPage - 1)}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <span aria-hidden="true">&lt;</span>
                </Button>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    key={`page-btn-${pageNum}`}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {currentPage < totalPages && (
                <Button
                  key="next-btn"
                  onClick={() => paginate(currentPage + 1)}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <span aria-hidden="true">&gt;</span>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalleList;