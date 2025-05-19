import React from 'react';
import { Edit } from 'lucide-react';
import { Contribuyente } from '../../models';
import { Button } from '../';

interface ContribuyenteListProps {
  contribuyentes: Contribuyente[];
  onEditar: (codigo: string) => void;
  loading?: boolean;
}

/**
 * Componente para mostrar la lista de contribuyentes en formato de tabla
 */
const ContribuyenteList: React.FC<ContribuyenteListProps> = ({
  contribuyentes,
  onEditar,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de contribuyentes</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contribuyente
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contribuyentes.map((contribuyente) => (
                  <tr key={contribuyente.codigo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribuyente.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contribuyente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribuyente.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribuyente.direccion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <Button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => onEditar(contribuyente.codigo)}
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {/* Filas vacías para mantener el aspecto de la tabla */}
                {contribuyentes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: Math.max(0, 8 - contribuyentes.length) }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                        &nbsp;
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          <div className="px-6 py-3 flex items-center justify-start border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Mostrar de 1 a {contribuyentes.length} de {contribuyentes.length} datos
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ContribuyenteList;