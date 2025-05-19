// src/components/calles/CalleList.tsx
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

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(calles.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = calles.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Manejar búsqueda
  const handleSearch = () => {
    onSearch(localSearchTerm);
    setCurrentPage(1); // Resetear a primera página al buscar
  };

  // Manejar cambio en el input de búsqueda
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  // Manejar tecla Enter en búsqueda
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Manejar eliminación de una calle
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Evitar que se seleccione la calle al eliminarla
    
    if (onDeleteCalle) {
      // Confirmar antes de eliminar
      if (window.confirm('¿Está seguro de eliminar esta calle?')) {
        onDeleteCalle(id);
      }
    }
  };

  // Formatear el tipo de vía
  const formatTipoVia = (tipoVia: string): string => {
    switch (tipoVia.toLowerCase()) {
      case 'avenida': return 'Av.';
      case 'jiron': return 'Jr.';
      case 'pasaje': return 'Psje.';
      case 'calle': return 'Calle';
      default: return tipoVia;
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Lista de calles</h2>
        
        {/* Contador de resultados */}
        <div className="text-sm text-gray-500">
          {calles.length} {calles.length === 1 ? 'resultado' : 'resultados'}
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
                  currentItems.map((calle) => (
                    <tr
                      key={calle.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectCalle(calle)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatTipoVia(calle.tipoVia)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {calle.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCalle(calle);
                          }}
                        >
                          Editar
                        </button>
                        {onDeleteCalle && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={(e) => handleDelete(e, calle.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, calles.length)} de {calles.length} resultados
            </div>
            <nav className="flex space-x-1">
              {currentPage > 1 && (
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <span aria-hidden="true">&lt;</span>
                </Button>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Mostrar siempre las páginas alrededor de la actual
                let pageNum;
                
                if (totalPages <= 5) {
                  // Si hay 5 o menos páginas, mostrar todas
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // Si estamos en las primeras 3 páginas
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Si estamos en las últimas 3 páginas
                  pageNum = totalPages - 4 + i;
                } else {
                  // En el medio
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded ${
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