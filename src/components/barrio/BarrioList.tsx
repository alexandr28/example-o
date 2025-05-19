import React, { useState, useEffect } from 'react';
import { Input, Button } from '../';
import { Barrio } from '../../models';

interface BarrioListProps {
  barrios: Barrio[];
  onSelectBarrio: (barrio: Barrio) => void;
  onDeleteBarrio?: (id: number) => void;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  loading?: boolean;
}

const BarrioList: React.FC<BarrioListProps> = ({ 
  barrios, 
  onSelectBarrio,
  onDeleteBarrio,
  onSearch,
  searchTerm: externalSearchTerm,
  loading = false 
}) => {
  // Si se proporciona un término de búsqueda externo, lo usamos
  // De lo contrario, mantenemos nuestro estado local para búsqueda en el lado del cliente
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Actualizar la página a 1 cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [externalSearchTerm]);

  // Si hay un manejador de búsqueda externo, usar ese, de lo contrario filtrar localmente
  const filteredBarrios = onSearch 
    ? barrios // Si hay búsqueda externa, los barrios ya vienen filtrados de la API
    : barrios.filter(barrio => 
        barrio.nombre.toLowerCase().includes(internalSearchTerm.toLowerCase()) ||
        (barrio.sector?.nombre && barrio.sector.nombre.toLowerCase().includes(internalSearchTerm.toLowerCase()))
      );

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredBarrios.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarrios.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Manejar la búsqueda
  const handleSearch = () => {
    if (onSearch) {
      onSearch(externalSearchTerm || internalSearchTerm);
    }
    setCurrentPage(1);
  };

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    if (onSearch) {
      // Si hay búsqueda del lado del servidor, actualizamos el término externo
      onSearch(newTerm);
    } else {
      // Si no, actualizamos el término interno
      setInternalSearchTerm(newTerm);
    }
  };

  // Manejar la eliminación de un barrio
  const handleDelete = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se seleccione el barrio al hacer clic en eliminar
    
    if (onDeleteBarrio && window.confirm('¿Está seguro de eliminar este barrio?')) {
      onDeleteBarrio(id);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de barrios</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center">
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Buscar por</label>
            </div>
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar por nombre del barrio o sector"
                value={onSearch ? externalSearchTerm : internalSearchTerm}
                onChange={handleSearchChange}
                disabled={loading}
                className="rounded-r-none"
              />
              <Button
                onClick={handleSearch}
                className="absolute inset-y-0 right-0 rounded-l-none"
                disabled={loading}
              >
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
              </Button>
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
                    Barrio
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((barrio) => (
                    <tr
                      key={barrio.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectBarrio(barrio)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {barrio.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {barrio.sector?.nombre || 'Sin sector'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {onDeleteBarrio && (
                          <Button
                            onClick={(e) => handleDelete(barrio.id, e)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
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
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredBarrios.length)} de {filteredBarrios.length} barrios
            </div>
            <nav className="flex space-x-1">
              <Button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                className="px-3 py-1 rounded text-gray-500 hover:bg-gray-100"
                disabled={currentPage === 1}
              >
                <span aria-hidden="true">&lt;</span>
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calcular qué números de página mostrar
                let pageNum;
                if (totalPages <= 5) {
                  // Mostrar páginas 1-5 si hay 5 o menos páginas
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // Al inicio, mostrar páginas 1-5
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Al final, mostrar las últimas 5 páginas
                  pageNum = totalPages - 4 + i;
                } else {
                  // En el medio, mostrar 2 páginas antes y 2 después de la actual
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
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