import React from 'react';
import { Select } from '../';
import { LetraValorUnitario, SubcategoriaValorUnitario } from '../../models';

interface ValorUnitarioListProps {
  años: { value: string, label: string }[];
  añoTabla: number | null;
  valoresPorCategoria: Record<string, Record<string, number>>;
  loading: boolean;
  onAñoTablaChange: (año: number | null) => void;
}

const ValorUnitarioList: React.FC<ValorUnitarioListProps> = ({
  años,
  añoTabla,
  valoresPorCategoria,
  loading,
  onAñoTablaChange
}) => {
  // Manejar cambio en el año de la tabla
  const handleAñoTablaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onAñoTablaChange(value ? parseInt(value) : null);
  };

  // Subcategorías para la tabla
  const subcategoriasTabla = [
    SubcategoriaValorUnitario.MUROS_Y_COLUMNAS,
    SubcategoriaValorUnitario.TECHOS,
    SubcategoriaValorUnitario.PISOS,
    SubcategoriaValorUnitario.PUERTAS_Y_VENTANAS,
    SubcategoriaValorUnitario.REVESTIMIENTOS,
    SubcategoriaValorUnitario.INSTALACIONES_ELECTRICAS_Y_SANITARIAS
  ];

  // Letras para la tabla
  const letrasTabla = Object.values(LetraValorUnitario);

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden mt-6">
      <div className="p-6">
        <div className="mb-4">
          <div className="w-48">
            <Select
              options={años}
              placeholder="Seleccione"
              value={añoTabla?.toString() || ''}
              onChange={handleAñoTablaChange}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Muros y Columnas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Techo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pisos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revestimiento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puertas y Ventanas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instalaciones Eléctricas y Sanitarias
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {letrasTabla.map((letra) => (
                <tr key={letra}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{letra}</td>
                  {subcategoriasTabla.map((subcategoria) => (
                    <td key={`${letra}-${subcategoria}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {valoresPorCategoria[subcategoria]?.[letra] !== undefined 
                        ? valoresPorCategoria[subcategoria][letra].toFixed(2) 
                        : '0.00'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ValorUnitarioList;