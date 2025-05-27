// src/components/generic/EntityList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface EntityListProps<T> {
  title: string;
  items: T[];
  columns: Column<T>[];
  onSelect: (item: T) => void;
  onDelete?: (id: number) => void;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  isOfflineMode?: boolean;
  itemsPerPage?: number;
  getItemId: (item: T) => number | undefined;
  searchTerm?: string;
}

export function EntityList<T extends Record<string, any>>({
  title,
  items,
  columns,
  onSelect,
  onDelete,
  onSearch,
  searchPlaceholder = "Buscar...",
  loading = false,
  isOfflineMode = false,
  itemsPerPage = 10,
  getItemId,
  searchTerm = ''
}: EntityListProps<T>) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Sincronizar término de búsqueda externo
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Filtrar items localmente
  const filteredItems = useMemo(() => {
    let filtered = [...items];
    
    // Aplicar ordenamiento
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [items, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Reset página cuando cambian los items
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(localSearchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleDelete = (e: React.MouseEvent, item: T) => {
    e.stopPropagation();
    const id = getItemId(item);
    
    if (id !== undefined && onDelete) {
      if (window.confirm('¿Está seguro de eliminar este elemento?')) {
        onDelete(id);
      }
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderPaginationButton = (pageNum: number, key: string) => (
    <Button
      key={key}
      onClick={() => setCurrentPage(pageNum)}
      className={`px-3 py-1 rounded ${
        currentPage === pageNum
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {pageNum}
    </Button>
  );

  const renderPaginationButtons = () => {
    const buttons = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(renderPaginationButton(i, `page-${i}`));
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          buttons.push(renderPaginationButton(i, `page-${i}`));
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          buttons.push(renderPaginationButton(i, `page-${i}`));
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          buttons.push(renderPaginationButton(i, `page-${i}`));
        }
      }
    }
    
    return buttons;
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        <div className="flex items-center space-x-2">
          {isOfflineMode && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Modo sin conexión
            </span>
          )}
          <span className="text-sm text-gray-500">
            {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Barra de búsqueda */}
        {onSearch && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  placeholder={searchPlaceholder}
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Buscar
              </Button>
            </div>
          </div>
        )}
        
        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center">
              <svg className="animate-spin h-8 w-8 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-gray-600">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key as string}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                        }`}
                        onClick={() => column.sortable && handleSort(column.key as string)}
                      >
                        <div className="flex items-center">
                          {column.label}
                          {column.sortable && (
                            <span className="ml-1">
                              {sortConfig?.key === column.key ? (
                                sortConfig.direction === 'asc' ? '▲' : '▼'
                              ) : '▼'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    {onDelete && (
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => {
                      const itemId = getItemId(item);
                      const key = itemId !== undefined ? `item-${itemId}` : `item-index-${index}`;
                      
                      return (
                        <tr
                          key={key}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => onSelect(item)}
                        >
                          {columns.map((column) => (
                            <td key={`${key}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {column.render
                                  ? column.render(getNestedValue(item, column.key as string), item)
                                  : getNestedValue(item, column.key as string)}
                              </div>
                            </td>
                          ))}
                          {onDelete && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Button
                                onClick={(e) => handleDelete(e, item)}
                                className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-md p-1 transition-colors"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length + (onDelete ? 1 : 0)} className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2 text-sm">
                            {items.length === 0 ? 'No hay datos disponibles' : 'No se encontraron resultados'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredItems.length)} de {filteredItems.length}
                </div>
                <nav className="flex space-x-1">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </Button>
                  
                  {renderPaginationButtons()}
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}