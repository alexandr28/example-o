import React, { useState } from 'react';
import { Input, Button } from '../';

interface Calle {
  id: number;
  tipoVia: string;
  nombre: string;
}

interface CalleListProps {
  calles: Calle[];
  onSelectCalle: (calle: Calle) => void;
}

const CalleList: React.FC<CalleListProps> = ({ calles, onSelectCalle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar la lista de calles según el término de búsqueda
  const filteredCalles = calles.filter(calle => 
    calle.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredCalles.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCalles.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de calles</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center">
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Buscar por</label>
            </div>
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar por nombre"
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
                  Nombre
                  <span className="ml-1">▼</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((calle) => (
                <tr
                  key={calle.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectCalle(calle)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {calle.tipoVia === 'avenida' ? 'Av. ' : calle.tipoVia === 'jiron' ? 'Jr. ' : 'Calle '}
                    {calle.nombre}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={1} className="px-6 py-4 text-center text-sm text-gray-500">
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
              Mostrar de {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredCalles.length)} de {filteredCalles.length} datos
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

export default CalleList;