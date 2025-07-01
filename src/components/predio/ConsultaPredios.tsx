// src/components/predio/ConsultaPredios.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { predioService } from '../../services/predioService';
import { Predio } from '../../models/Predio';
import { NotificationService } from '../utils/Notification';

// Componente principal
const ConsultaPredios: React.FC = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [predios, setPredios] = useState<Predio[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    codPredio: '',
    anio: new Date().getFullYear(),
    direccion: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarPredios();
  }, []);

  // Función para cargar predios con filtros
  const cargarPredios = useCallback(async () => {
    setLoading(true);
    try {
      let prediosData: Predio[] = [];
      
      // Si hay filtros activos, usar el método de búsqueda
      if (filtros.codPredio || filtros.anio || filtros.direccion) {
        prediosData = await predioService.buscarPredios(
          filtros.codPredio || undefined,
          filtros.anio || undefined,
          filtros.direccion ? parseInt(filtros.direccion) : undefined
        );
      } else {
        // Sin filtros, cargar todos los predios
        prediosData = await predioService.getAll();
      }
      
      setPredios(prediosData);
    } catch (error) {
      console.error('Error al cargar predios:', error);
      NotificationService.error('Error al cargar los predios');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Función de búsqueda local
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Aplicar filtros
  const aplicarFiltros = () => {
    setCurrentPage(1);
    cargarPredios();
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      codPredio: '',
      anio: new Date().getFullYear(),
      direccion: ''
    });
    setSearchTerm('');
  };

  // Filtrar predios según el término de búsqueda local
  const filteredPredios = predios.filter(predio => 
    predio.codigoPredio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.tipoPredio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredPredios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPredios = filteredPredios.slice(startIndex, endIndex);

  // Handlers para acciones
  const handleEdit = (predio: Predio) => {
    console.log('Editar predio:', predio.codigoPredio);
    navigate(`/predio/editar/${predio.id}`);
  };

  const handleDelete = async (predio: Predio) => {
    if (window.confirm(`¿Está seguro de eliminar el predio ${predio.codigoPredio}?`)) {
      try {
        setLoading(true);
        await predioService.delete(predio.id!);
        NotificationService.success('Predio eliminado correctamente');
        await cargarPredios();
      } catch (error) {
        console.error('Error al eliminar predio:', error);
        NotificationService.error('Error al eliminar el predio');
      } finally {
        setLoading(false);
      }
    }
  };

  // Formatear número a moneda
  const formatCurrency = (value: number) => {
    return value.toFixed(2);
  };

  return (
    <div className="p-6">
      {/* Título */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Características del predio
        </h2>
      </div>

      {/* Sección de filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros de búsqueda</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código Predio
              </label>
              <input
                type="text"
                value={filtros.codPredio}
                onChange={(e) => setFiltros({ ...filtros, codPredio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: 20241"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Año
              </label>
              <input
                type="number"
                value={filtros.anio}
                onChange={(e) => setFiltros({ ...filtros, anio: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={filtros.direccion}
                onChange={(e) => setFiltros({ ...filtros, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="ID de dirección"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Barra de búsqueda local */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en los resultados..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Tabla de predios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Código predio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo Predio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Área del<br/>Terreno
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor<br/>Arancel
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor Terreno
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor de<br/>Construcción
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Otras<br/>Instalaciones
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Autoavalo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentPredios.map((predio) => (
                    <tr key={predio.codigoPredio} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {predio.codigoPredio}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {predio.tipoPredio}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {formatCurrency(predio.areaTerreno)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {formatCurrency(predio.valorArancel)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {formatCurrency(predio.valorTerreno)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {formatCurrency(predio.valorConstruccion)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {formatCurrency(predio.otrasInstalaciones)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {formatCurrency(predio.autoavalo)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(predio)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(predio)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrar de {startIndex + 1} a {Math.min(endIndex, filteredPredios.length)} de {filteredPredios.length} datos
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-500"
                  >
                    1
                  </button>
                  {currentPage > 2 && <span className="px-2 py-1">...</span>}
                  {currentPage > 1 && currentPage < totalPages && (
                    <button className="px-3 py-1 text-sm bg-green-500 text-white rounded-md">
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-500"
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Exportación por defecto
export default ConsultaPredios;