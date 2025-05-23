// src/components/sector/SectorList.tsx - CORREGIDO PARA MOSTRAR NOMBRES REALES

import React, { useState, useEffect } from 'react';
import { Input, Button } from '../';

interface Sector {
  id?: number;
  nombre: string;
}

interface SectorListProps {
  sectores: Sector[];
  onSelectSector: (sector: Sector) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
}

const SectorList: React.FC<SectorListProps> = ({ 
  sectores, 
  onSelectSector,
  isOfflineMode = false,
  onEliminar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debug: Log sectores recibidos
  useEffect(() => {
    console.log('📋 [SectorList] Sectores recibidos:', sectores);
    console.log('📋 [SectorList] Cantidad:', sectores?.length || 0);
    
    if (sectores && sectores.length > 0) {
      console.log('📋 [SectorList] Primer sector:', sectores[0]);
      console.log('📋 [SectorList] Estructura del primer sector:');
      console.log('  - ID:', sectores[0].id);
      console.log('  - Nombre:', sectores[0].nombre);
      console.log('  - Tipo de nombre:', typeof sectores[0].nombre);
      
      // Verificar todos los sectores
      sectores.forEach((sector, index) => {
        console.log(`📋 [SectorList] Sector ${index}:`, {
          id: sector.id,
          nombre: sector.nombre,
          tipoNombre: typeof sector.nombre,
          nombreValido: !!(sector.nombre && sector.nombre.trim())
        });
      });
    }
  }, [sectores]);

  // Filtrar sectores de manera más robusta
  const filteredSectores = React.useMemo(() => {
    console.log('🔍 [SectorList] Iniciando filtrado...');
    
    if (!sectores || !Array.isArray(sectores)) {
      console.warn('⚠️ [SectorList] sectores no es un array válido:', sectores);
      return [];
    }

    // Primero, validar y limpiar sectores
    const sectoresValidos = sectores.filter((sector, index) => {
      if (!sector || typeof sector !== 'object') {
        console.warn(`⚠️ [SectorList] Sector ${index} no es un objeto válido:`, sector);
        return false;
      }
      
      if (!sector.nombre || typeof sector.nombre !== 'string') {
        console.warn(`⚠️ [SectorList] Sector ${index} no tiene nombre válido:`, sector);
        return false;
      }
      
      if (sector.nombre.trim().length === 0) {
        console.warn(`⚠️ [SectorList] Sector ${index} tiene nombre vacío:`, sector);
        return false;
      }
      
      return true;
    });

    console.log('✅ [SectorList] Sectores válidos:', sectoresValidos.length, 'de', sectores.length);

    // Luego aplicar filtro de búsqueda
    if (!searchTerm || searchTerm.trim() === '') {
      console.log('🔍 [SectorList] Sin término de búsqueda, devolviendo todos los sectores válidos');
      return sectoresValidos;
    }

    const termLower = searchTerm.toLowerCase().trim();
    const sectoresFiltrados = sectoresValidos.filter(sector => {
      const nombreLower = sector.nombre.toLowerCase();
      const coincide = nombreLower.includes(termLower);
      
      if (coincide) {
        console.log(`🎯 [SectorList] Sector coincide con búsqueda "${termLower}":`, sector.nombre);
      }
      
      return coincide;
    });

    console.log('🔍 [SectorList] Sectores filtrados por búsqueda:', sectoresFiltrados.length);
    
    return sectoresFiltrados;
  }, [sectores, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredSectores.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSectores.slice(indexOfFirstItem, indexOfLastItem);

  // Debug de elementos actuales
  useEffect(() => {
    console.log('📄 [SectorList] Elementos en página actual:', currentItems.length);
    console.log('📄 [SectorList] Página:', currentPage, 'de', totalPages);
    console.log('📄 [SectorList] Items actuales:', currentItems);
  }, [currentItems, currentPage, totalPages]);

  // Cambiar de página
  const paginate = (pageNumber: number) => {
    console.log('📄 [SectorList] Cambiando a página:', pageNumber);
    setCurrentPage(pageNumber);
  };

  // Manejar eliminación de un sector
  const handleEliminar = (id: number | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (id !== undefined && onEliminar) {
      if (window.confirm('¿Está seguro de eliminar este sector?')) {
        console.log('🗑️ [SectorList] Eliminando sector ID:', id);
        onEliminar(id);
      }
    } else {
      console.warn('⚠️ [SectorList] ID no válido para eliminar:', id);
    }
  };

  // Manejar selección de sector
  const handleSelectSector = (sector: Sector) => {
    console.log('🎯 [SectorList] Seleccionando sector:', sector);
    onSelectSector(sector);
  };

  // Función para renderizar nombre del sector de manera segura
  const renderSectorNombre = (sector: Sector, index: number) => {
    if (!sector) {
      return `Sector ${index + 1} (dato nulo)`;
    }
    
    if (!sector.nombre || typeof sector.nombre !== 'string') {
      return `Sector ${sector.id || index + 1} (sin nombre)`;
    }
    
    const nombre = sector.nombre.trim();
    if (nombre.length === 0) {
      return `Sector ${sector.id || index + 1} (nombre vacío)`;
    }
    
    return nombre;
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          Lista de sectores ({filteredSectores.length})
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
                placeholder="Buscar por nombre de sector"
                value={searchTerm}
                onChange={(e) => {
                  console.log('🔍 [SectorList] Término de búsqueda cambiado:', e.target.value);
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Resetear a primera página al buscar
                }}
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
                currentItems.map((sector, index) => {
                  const globalIndex = indexOfFirstItem + index;
                  const sectorNombe = renderSectorNombre(sector, globalIndex);
                  
                  return (
                    <tr
                      key={sector.id !== undefined ? `sector-${sector.id}` : `sector-index-${globalIndex}`}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectSector(sector)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sectorNombe}
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-500">
                            ID: {sector.id || 'N/A'} | Índice: {globalIndex}
                          </div>
                        )}
                      </td>
                      {onEliminar && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            onClick={(e) => handleEliminar(sector.id, e)}
                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-md p-1 transition-colors"
                            disabled={!sector.id}
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
                  <td colSpan={onEliminar ? 2 : 1} className="px-6 py-4 text-center text-sm text-gray-500">
                    {sectores && sectores.length === 0 ? 
                      'No hay sectores disponibles' : 
                      searchTerm ? 
                        `No se encontraron sectores que coincidan con "${searchTerm}"` :
                        'No se encontraron sectores'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Información de debug en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <div className="font-semibold mb-1">🔧 Debug Info:</div>
            <div>📊 Sectores recibidos: {sectores?.length || 0}</div>
            <div>✅ Sectores válidos: {filteredSectores.length}</div>
            <div>📄 En página actual: {currentItems.length}</div>
            <div>🔍 Término búsqueda: "{searchTerm}"</div>
            <div>🌐 Modo offline: {isOfflineMode ? 'Sí' : 'No'}</div>
            {sectores && sectores.length > 0 && (
              <div>🎯 Primer sector: {sectores[0]?.nombre || 'Sin nombre'}</div>
            )}
          </div>
        )}
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrar de {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredSectores.length)} de {filteredSectores.length} datos
            </div>
            <nav className="flex space-x-1">
              <Button
                key="prev-page"
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                className="px-3 py-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`px-3 py-1 rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
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
                className="px-3 py-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SectorList;