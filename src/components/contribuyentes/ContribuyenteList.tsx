// src/components/contribuyentes/ContribuyenteList.tsx
import React from 'react';
import Button from '../ui/Button';

interface ContribuyenteListItem {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
}

interface ContribuyenteListProps {
  contribuyentes: ContribuyenteListItem[];
  onEditar?: (codigo: string) => void;
  loading?: boolean;
}

/**
 * Componente para mostrar la lista de contribuyentes
 */
const ContribuyenteList: React.FC<ContribuyenteListProps> = ({
  contribuyentes = [],
  onEditar,
  loading = false
}) => {
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Cargando contribuyentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CÓDIGO ▼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CONTRIBUYENTE ▼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DOCUMENTO ▼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DIRECCIÓN ▼
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contribuyentes.length > 0 ? (
              contribuyentes.map((contribuyente, index) => (
                <tr key={`${contribuyente.codigo}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contribuyente.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contribuyente.contribuyente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contribuyente.documento}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="truncate max-w-xs" title={contribuyente.direccion}>
                      {contribuyente.direccion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onEditar?.(contribuyente.codigo.toString())}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No se encontraron resultados</p>
                    <p className="text-sm mt-1">Intente con otros criterios de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {contribuyentes.length > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700">
            Mostrando {contribuyentes.length} de {contribuyentes.length} registros
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContribuyenteList;