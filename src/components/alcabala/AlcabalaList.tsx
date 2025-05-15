import React from 'react';
import { Alcabala, PaginacionOptions } from '../../models/Alcabala';
import {Button} from '..'

interface AlcabalaListProps {
  alcabalas: Alcabala[];
  paginacion: PaginacionOptions;
  onCambiarPagina: (pagina: number) => void;
  loading?: boolean;
}

/**
 * Componente para mostrar la lista de valores de Alcabala
 */
const AlcabalaList: React.FC<AlcabalaListProps> = ({
  alcabalas,
  paginacion,
  onCambiarPagina,
  loading = false
}) => {
  // Generar array con números de página para paginación
  const paginasArray = () => {
    const totalPaginas = Math.ceil(paginacion.total / paginacion.porPagina);
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de valores de alcabala</h2>
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
                    Año
                    <span className="ml-1">▼</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasa
                    <span className="ml-1">▼</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alcabalas.length > 0 ? (
                  alcabalas.map((alcabala) => (
                    <tr key={alcabala.id || alcabala.anio} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alcabala.anio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alcabala.tasa.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {paginacion.total > paginacion.porPagina && (
            <div className="px-6 py-3 flex justify-center border-t border-gray-200">
              <nav className="flex items-center space-x-1">
                {paginasArray().map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => onCambiarPagina(pagina)}
                    className={`px-3 py-1 rounded ${
                      paginacion.pagina === pagina
                        ? 'bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
                {paginacion.pagina < Math.ceil(paginacion.total / paginacion.porPagina) && (
                  <Button
                    onClick={() => onCambiarPagina(paginacion.pagina + 1)}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <span aria-hidden="true">&gt;</span>
                  </Button>
                )}
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlcabalaList;