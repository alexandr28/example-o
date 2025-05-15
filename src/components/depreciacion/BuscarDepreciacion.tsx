import React from 'react';
import { Select, Button } from '../../components';

interface BuscarDepreciacionProps {
  aniosDisponibles: { value: string, label: string }[];
  tiposCasa: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tipoCasaSeleccionado: string | null;
  onAnioChange: (anio: number | null) => void;
  onTipoCasaChange: (tipoCasa: string | null) => void;
  onBuscar: () => void;
  loading?: boolean;
}

/**
 * Componente para búsqueda de depreciación
 */
const BuscarDepreciacion: React.FC<BuscarDepreciacionProps> = ({
  aniosDisponibles,
  tiposCasa,
  anioSeleccionado,
  tipoCasaSeleccionado,
  onAnioChange,
  onTipoCasaChange,
  onBuscar,
  loading = false
}) => {
  // Manejar cambio de año
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const anio = e.target.value ? parseInt(e.target.value) : null;
    onAnioChange(anio);
  };

  // Manejar cambio de tipo de casa
  const handleTipoCasaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipoCasa = e.target.value || null;
    onTipoCasaChange(tipoCasa);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Búsqueda de depreciación</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Campo Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <Select
              options={aniosDisponibles}
              value={anioSeleccionado?.toString() || ''}
              onChange={handleAnioChange}
              disabled={loading}
              placeholder="Seleccione"
            />
          </div>
          
          {/* Campo Tipo de Casa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipos de casa</label>
            <Select
              options={tiposCasa}
              value={tipoCasaSeleccionado || ''}
              onChange={handleTipoCasaChange}
              disabled={loading}
              placeholder="Seleccione"
            />
          </div>
          
          {/* Botón Buscar */}
          <div>
            <Button
              onClick={onBuscar}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Buscar
            </Button>
          </div>
        </div>
        
        {/* Tabla de resultados */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Antigüedad
                  <span className="ml-1">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                  <span className="ml-1">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Muy bueno
                  <span className="ml-1">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bueno
                  <span className="ml-1">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular
                  <span className="ml-1">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Malo
                  <span className="ml-1">▼</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hasta 5 años
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Concreto
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hasta 5 años
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ladrillo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hasta 5 años
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Adobe
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hasta 10 años
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Concreto
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hasta 10 años
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ladrillo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hasta 10 años
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Adobe
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="mt-4 flex justify-end space-x-1">
          <button className="px-3 py-1 rounded bg-gray-300 text-gray-700">
            1
          </button>
          <button className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200">
            2
          </button>
          <button className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200">
            3
          </button>
          <Button className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200">
            4
          </Button>
          <Button className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200">
            <span aria-hidden="true">&gt;</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuscarDepreciacion;