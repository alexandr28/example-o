// src/components/direcciones/DireccionList.tsx - ACTUALIZADO
import React, { useState } from 'react';
import { Input, Button } from '../';
import { Direccion } from '../../models';

interface DireccionListProps {
  direcciones: Direccion[];
  onSelectDireccion: (direccion: Direccion) => void;
  loading?: boolean;
}

const DireccionList: React.FC<DireccionListProps> = ({ 
  direcciones, 
  onSelectDireccion,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar la lista de direcciones según el término de búsqueda
  const filteredDirecciones = direcciones.filter(direccion => 
    direccion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    direccion.cuadra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    direccion.nombreSector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    direccion.nombreBarrio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    direccion.nombreVia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular la cantidad de páginas
  const totalPages = Math.ceil(filteredDirecciones.length / itemsPerPage);
  
  // Obtener los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDirecciones.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Formatear el lado para mostrar
  const formatLado = (lado: string): string => {
    switch (lado) {
      case '-': return 'Ninguno';
      case 'I': return 'Izquierdo';
      case 'D': return 'Derecho';
      case 'P': return 'Par';
      case 'IM': return 'Impar';
      default: return lado;
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de direcciones</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center">
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Buscar por</label>
            </div>
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar por dirección"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
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
                    Dirección <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lado <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote Inicial <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote Final <span className="ml-1">▼</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((direccion) => (
                  <tr 
                    key={direccion.id} 
                    onClick={() => onSelectDireccion(direccion)}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {direccion.descripcion || 'Sin descripción'}
                      </div>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500">
                          ID: {direccion.id} | Sector: {direccion.sectorId} | Barrio: {direccion.barrioId} | Calle: {direccion.calleId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatLado(direccion.lado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {direccion.loteInicial}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {direccion.loteFinal}
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
              Mostrando de {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredDirecciones.length)} de {filteredDirecciones.length} registros
            </div>
            <nav className="flex space-x-1">
              <Button
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                className="px-3 py-1 rounded text-gray-500 hover:bg-gray-100"
                disabled={currentPage === 1}
              >
                <span aria-hidden="true">&lt;</span>
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                // Mostrar solo algunos números de página
                if (
                  number === 1 ||
                  number === totalPages ||
                  (number >= currentPage - 2 && number <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${
                        currentPage === number
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {number}
                    </button>
                  );
                } else if (
                  number === currentPage - 3 ||
                  number === currentPage + 3
                ) {
                  return <span key={number} className="px-2">...</span>;
                }
                return null;
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

export default DireccionList;