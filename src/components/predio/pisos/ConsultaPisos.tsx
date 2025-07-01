// src/components/predio/pisos/ConsultaPisos.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Search } from 'lucide-react';
import SelectorPredios from './SelectorPredios';

// Interfaz para los datos del piso
interface Piso {
  id: number;
  item: number;
  descripcion: string;
  valorUnitario: number;
  incremento: number;
  porcentajeDepreciacion: number;
  valorUnicoDepreciado: number;
  valorAreaConstruida: number;
}

// Interfaz para el predio
interface Predio {
  id: number | string;
  codigoPredio: string;
  direccion?: string;
  tipoPredio?: string;
  contribuyente?: string;
  areaTerreno?: number;
}

// Componente principal
const ConsultaPisos: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [predio, setPredio] = useState<Predio | null>(null);
  const [pisos, setPisos] = useState<Piso[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>('');
  const [showSelectorPredios, setShowSelectorPredios] = useState(false);
  
  // Años disponibles
  const anios = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Datos de ejemplo
  const pisosData: Piso[] = [
    {
      id: 1,
      item: 1,
      descripcion: 'Primer piso',
      valorUnitario: 731.52,
      incremento: 0.00,
      porcentajeDepreciacion: 0.32,
      valorUnicoDepreciado: 497.53,
      valorAreaConstruida: 40500.75
    },
    {
      id: 2,
      item: 2,
      descripcion: 'Segundo piso',
      valorUnitario: 731.52,
      incremento: 0.00,
      porcentajeDepreciacion: 0.32,
      valorUnicoDepreciado: 497.53,
      valorAreaConstruida: 40500.75
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    // Establecer año actual por defecto
    setAnioSeleccionado(new Date().getFullYear().toString());
  }, []);

  // Función para buscar pisos
  const handleBuscar = async () => {
    if (!predio) {
      alert('Por favor seleccione un predio');
      return;
    }
    
    if (!anioSeleccionado) {
      alert('Por favor seleccione un año');
      return;
    }

    setLoading(true);
    try {
      // Simular búsqueda
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPisos(pisosData);
    } catch (error) {
      console.error('Error al buscar pisos:', error);
      alert('Error al buscar pisos');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar selección de predio
  const handleSelectPredio = (predioSeleccionado: Predio) => {
    setPredio(predioSeleccionado);
    setPisos([]); // Limpiar pisos al cambiar de predio
  };

  // Función para editar piso
  const handleEdit = (piso: Piso) => {
    console.log('Editar piso:', piso);
  };

  // Formatear número
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <span className="text-gray-700 dark:text-gray-300">Módulo</span>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300">Predio</span>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300">Pisos</span>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Consultar piso</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Sección: Seleccionar predio */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Seleccionar predio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <button
            type="button"
            onClick={() => setShowSelectorPredios(true)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500"
          >
            Seleccionar predio
          </button>
          
          <input
            type="text"
            placeholder="Código de predio"
            value={predio?.codigoPredio || ''}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            readOnly
          />
          
          <input
            type="text"
            placeholder="Dirección predial"
            value={predio?.direccion || ''}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            readOnly
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Año
            </label>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccione</option>
              {anios.map(anio => (
                <option key={anio.value} value={anio.value}>
                  {anio.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            onClick={handleBuscar}
            disabled={loading || !predio || !anioSeleccionado}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Sección: Datos del piso */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Datos del piso
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : pisos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor unitario
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Incremento 5%
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % Depreciación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor Único Depreciado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor Área<br/>Construida
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pisos.map((piso) => (
                  <tr key={piso.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                      {piso.item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {piso.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {formatNumber(piso.valorUnitario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {formatNumber(piso.incremento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {formatNumber(piso.porcentajeDepreciacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {formatNumber(piso.valorUnicoDepreciado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {formatNumber(piso.valorAreaConstruida)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      <button
                        onClick={() => handleEdit(piso)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No hay datos para mostrar</p>
            <p className="text-sm mt-2">Seleccione un predio y año, luego presione buscar</p>
          </div>
        )}
      </div>

      {/* Modal de selección de predios */}
      <SelectorPredios
        isOpen={showSelectorPredios}
        onClose={() => setShowSelectorPredios(false)}
        onSelect={handleSelectPredio}
      />
    </div>
  );
};

// Exportación por defecto
export default ConsultaPisos;