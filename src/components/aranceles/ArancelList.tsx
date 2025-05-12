import React, { useState } from 'react';
import { Input, Select, Button } from '../';
import { Arancel } from '../../models';

interface ArancelListProps {
  aranceles: Arancel[];
  años: { value: string, label: string }[];
  onSelectArancel: (arancel: Arancel) => void;
  onFilter: (año?: number, terminoBusqueda?: string) => Arancel[];
  loading?: boolean;
}

const ArancelList: React.FC<ArancelListProps> = ({ 
  aranceles, 
  años,
  onSelectArancel,
  onFilter,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAño, setSelectedAño] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar aranceles según los criterios
  const filteredAranceles = onFilter(
    selectedAño ? parseInt(selectedAño) : undefined,
    searchTerm
  );

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredAranceles.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAranceles.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Manejar búsqueda
  const handleSearch = () => {
    setCurrentPage(1); // Resetear a primera página cuando se realiza una búsqueda
  };

  // Manejar cambio de año
  const handleAñoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAño(e.target.value);
    setCurrentPage(1); // Resetear a primera página cuando cambia el año
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de aranceles por dirección</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <Select
              options={[{ value: '', label: 'Todos' }, ...años]}
              value={selectedAño}
              onChange={handleAñoChange}
              disabled={loading}
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por</label>
            <div className="flex">
              <Input
                placeholder="Ingresar dirección"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="rounded-r-none"
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="rounded-l-none"
              >
                Buscar
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
                    Año
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                    <span className="ml-1">▼</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((arancel) => (
                  <tr
                    key={arancel.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectArancel(arancel)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {arancel.año}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {arancel.direccion?.descripcion || `Dirección ID: ${arancel.direccionId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {arancel.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        arancel.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {arancel.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
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
              Mostrar de {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredAranceles.length)} de {filteredAranceles.length} datos
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

export default ArancelList;