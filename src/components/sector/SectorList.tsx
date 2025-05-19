import React, { useState } from 'react';
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

  // Filtrar la lista de sectores según el término de búsqueda
  const filteredSectores = sectores.filter(sector => 
    sector.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredSectores.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSectores.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Manejar eliminación de un sector
  const handleEliminar = (id: number | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active la selección del sector
    
    if (id && onEliminar) {
      if (window.confirm('¿Está seguro de eliminar este sector?')) {
        onEliminar(id);
      }
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Lista de sectores</h2>
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
              {currentItems.map((sector) => (
                <tr
                  key={sector.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectSector(sector)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sector.nombre}
                  </td>
                  {onEliminar && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => handleEliminar(sector.id, e)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-md p-1"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={onEliminar ? 2 : 1} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrar de {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredSectores.length)} de {filteredSectores.length} datos
            </div>
            <nav className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <Button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? 'bg-gray-200 text-gray-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {number}
                </Button>
              ))}
              <Button
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

export default SectorList;