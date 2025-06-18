// src/components/modal/SelectorDirecciones.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { direccionService } from '../../services/direcionService';
import { NotificationService } from '../utils/Notification';

// Interfaz para Dirección basada en la respuesta de la API
interface Direccion {
  id: number;
  codDireccion?: number;
  descripcion: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  // Campos adicionales del API
  sectorId?: number;
  barrioId?: number;
  calleId?: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  cuadra?: string;
}

interface SelectorDireccionesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDireccion: (direccion: Direccion) => void;
  direcciones?: Direccion[]; // Opcional, puede cargar sus propias direcciones
}

const SelectorDirecciones: React.FC<SelectorDireccionesProps> = ({
  isOpen,
  onClose,
  onSelectDireccion,
  direcciones: direccionesProp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parámetros de búsqueda
  const [nombreVia, setNombreVia] = useState('');
  const [codSector, setCodSector] = useState('');
  const [codBarrio, setCodBarrio] = useState('');

  // Cargar direcciones al abrir el modal
  useEffect(() => {
    if (isOpen && !direccionesProp) {
      cargarDirecciones();
    } else if (direccionesProp) {
      setDirecciones(direccionesProp);
    }
  }, [isOpen, direccionesProp]);

  // Función para cargar direcciones desde la API
  const cargarDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar los parámetros del formulario o valores por defecto
      const params = {
        nombreVia: nombreVia || 'a', // Si está vacío, usar 'a' como valor por defecto
        codUsuario: 1 // Siempre enviar codUsuario: 1
      };
      
      console.log('🔍 Buscando direcciones con parámetros:', params);
      
      const data = await direccionService.buscarPorNombreVia(params);
      setDirecciones(data);
      
      if (data.length === 0) {
        NotificationService.info('No se encontraron direcciones con los criterios especificados');
      } else {
        console.log(`✅ Se encontraron ${data.length} direcciones`);
      }
      
    } catch (err: any) {
      console.error('Error al cargar direcciones:', err);
      setError('Error al cargar direcciones');
      NotificationService.error('Error al cargar direcciones');
      
      // Si hay error, intentar cargar del caché
      try {
        const cachedData = await direccionService.getAll();
        if (cachedData.length > 0) {
          setDirecciones(cachedData);
          NotificationService.info('Mostrando direcciones del caché');
        }
      } catch (cacheError) {
        console.error('Error al cargar del caché:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [nombreVia]);

  // Buscar direcciones con los filtros
  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarDirecciones();
  };

  // Filtrar direcciones localmente por el término de búsqueda
  const filteredDirecciones = direcciones.filter(direccion => {
    const searchLower = searchTerm.toLowerCase();
    return (
      direccion.descripcion.toLowerCase().includes(searchLower) ||
      direccion.nombreSector?.toLowerCase().includes(searchLower) ||
      direccion.nombreBarrio?.toLowerCase().includes(searchLower) ||
      direccion.nombreVia?.toLowerCase().includes(searchLower) ||
      direccion.cuadra?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleConfirmSelection = () => {
    if (selectedDireccion) {
      onSelectDireccion(selectedDireccion);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDireccion(null);
    setSearchTerm('');
    setNombreVia('');
    setCodSector('');
    setCodBarrio('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Selector de direcciones" size="lg">
      {/* Formulario de búsqueda */}
      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Nombre de vía"
            value={nombreVia}
            onChange={(e) => setNombreVia(e.target.value)}
            placeholder="Ej: Las Orquídeas"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                cargarDirecciones();
              }
            }}
          />
          <Input
            label="Código sector"
            value={codSector}
            onChange={(e) => setCodSector(e.target.value)}
            placeholder="Ej: 1"
            type="number"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                cargarDirecciones();
              }
            }}
          />
          <Input
            label="Código barrio"
            value={codBarrio}
            onChange={(e) => setCodBarrio(e.target.value)}
            placeholder="Ej: 1"
            type="number"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                cargarDirecciones();
              }
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="primary" 
            disabled={loading}
            onClick={cargarDirecciones}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              setNombreVia('');
              setCodSector('');
              setCodBarrio('');
            }}
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Búsqueda local */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Filtrar resultados..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Tabla de resultados */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuadra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lote Inicial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lote Final
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDirecciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron direcciones
                  </td>
                </tr>
              ) : (
                filteredDirecciones.map((direccion) => (
                  <tr 
                    key={direccion.id || direccion.codDireccion} 
                    className={`cursor-pointer transition-colors ${
                      selectedDireccion?.id === direccion.id 
                        ? 'bg-blue-50 hover:bg-blue-100' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelect(direccion)}
                  >
                    <td className="px-6 py-4 whitespace-normal text-sm">
                      {direccion.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {direccion.cuadra || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {direccion.lado || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {direccion.loteInicial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {direccion.loteFinal}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Información de resultados */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredDirecciones.length} de {direcciones.length} direcciones
      </div>

      {/* Botón de selección */}
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={handleConfirmSelection} 
          disabled={!selectedDireccion}
          className="w-40"
          variant="primary"
        >
          Seleccionar
        </Button>
      </div>
    </Modal>
  );
};

export default SelectorDirecciones;