// src/components/predio/SelectorPredios.tsx

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface Predio {
  id: number;
  codigoPredio: string;
  tipoPredio: string;
  direccion?: string;
  contribuyente?: string;
  areaTerreno: number;
}

interface SelectorPrediosProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (predio: Predio) => void;
}

const SelectorPredios: React.FC<SelectorPrediosProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [predios, setPredios] = useState<Predio[]>([]);
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo
  const prediosData: Predio[] = [
    {
      id: 1,
      codigoPredio: '1045',
      tipoPredio: 'Predio independiente',
      direccion: 'Av. Principal 123',
      contribuyente: 'Juan Pérez García',
      areaTerreno: 250.00
    },
    {
      id: 2,
      codigoPredio: '1022',
      tipoPredio: 'Departamento en edificio',
      direccion: 'Jr. Las Flores 456',
      contribuyente: 'María López Rodríguez',
      areaTerreno: 120.00
    },
    {
      id: 3,
      codigoPredio: '456',
      tipoPredio: 'Predio en quinta',
      direccion: 'Calle Los Álamos 789',
      contribuyente: 'Carlos Díaz Mendoza',
      areaTerreno: 180.00
    }
  ];

  // Cargar predios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarPredios();
    }
  }, [isOpen]);

  const cargarPredios = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      setPredios(prediosData);
    } catch (error) {
      console.error('Error al cargar predios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar predios
  const prediosFiltrados = predios.filter(predio =>
    predio.codigoPredio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.contribuyente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (predio: Predio) => {
    onSelect(predio);
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Seleccionar Predio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, dirección o contribuyente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Lista de predios */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : prediosFiltrados.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo Predio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contribuyente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Área (m²)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {prediosFiltrados.map((predio) => (
                  <tr key={predio.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {predio.codigoPredio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {predio.tipoPredio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {predio.direccion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {predio.contribuyente || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {predio.areaTerreno.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleSelect(predio)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No se encontraron predios</p>
              <p className="text-sm mt-2">Intente con otros términos de búsqueda</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectorPredios;