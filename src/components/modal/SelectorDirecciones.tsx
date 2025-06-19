// src/components/modal/SelectorDirecciones.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { direccionService } from '../../services/direcionService';
import { NotificationService } from '../utils/Notification';
import { Search } from 'lucide-react';

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
      // Cargar con valor por defecto al abrir
      buscarDirecciones();
    } else if (direccionesProp) {
      setDirecciones(direccionesProp);
    }
  }, [isOpen, direccionesProp]);

  // Función para buscar direcciones
  const buscarDirecciones = useCallback(async () => {
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
      console.error('❌ Error al buscar direcciones:', err);
      setError(err.message || 'Error al buscar direcciones');
      NotificationService.error('Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  }, [nombreVia]);

  // Función para limpiar búsqueda
  const limpiarBusqueda = () => {
    setNombreVia('');
    setCodSector('');
    setCodBarrio('');
    setSearchTerm('');
    setSelectedDireccion(null);
    // Recargar con valores por defecto
    buscarDirecciones();
  };

  // Filtrar direcciones según el término de búsqueda
  const direccionesFiltradas = direcciones.filter(dir => {
    const descripcionCompleta = dir.descripcion || 
      `${dir.nombreSector || ''} ${dir.nombreBarrio || ''} ${dir.nombreVia || ''} ${dir.cuadra ? `Cuadra ${dir.cuadra}` : ''}`;
    
    return descripcionCompleta.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Función para manejar la selección
  const handleSeleccionar = () => {
    if (selectedDireccion) {
      onSelectDireccion(selectedDireccion);
      onClose();
    } else {
      NotificationService.warning('Por favor seleccione una dirección');
    }
  };

  // Función para obtener el texto del lado
  const getLadoText = (lado: string) => {
    switch (lado) {
      case 'I': return 'Izquierdo';
      case 'D': return 'Derecho';
      case 'P': return 'Par';
      case 'IM': return 'Impar';
      case '-': return '-';
      default: return lado;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selector de direcciones" size="lg">
      <div className="space-y-4">
        {/* Formulario de búsqueda */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de vía
              </label>
              <Input
                type="text"
                placeholder="Ej: Las Orquídeas"
                value={nombreVia}
                onChange={(e) => setNombreVia(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarDirecciones()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código sector
              </label>
              <Input
                type="text"
                placeholder="Ej: 1"
                value={codSector}
                onChange={(e) => setCodSector(e.target.value)}
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código barrio
              </label>
              <Input
                type="text"
                placeholder="Ej: 1"
                value={codBarrio}
                onChange={(e) => setCodBarrio(e.target.value)}
                disabled
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={buscarDirecciones}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Search size={16} />
              Buscar
            </Button>
            <Button
              variant="secondary"
              onClick={limpiarBusqueda}
              disabled={loading}
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Campo de filtrado */}
        <div>
          <Input
            type="text"
            placeholder="Filtrar resultados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tabla de resultados */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuadra
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote Inicial
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote Final
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Cargando direcciones...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : direccionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron direcciones
                    </td>
                  </tr>
                ) : (
                  direccionesFiltradas.map((direccion) => (
                    <tr
                      key={direccion.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedDireccion?.id === direccion.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedDireccion(direccion)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {direccion.descripcion || 
                         `${direccion.nombreSector || ''} ${direccion.nombreBarrio || ''} ${direccion.nombreVia || ''}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {direccion.cuadra || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {getLadoText(direccion.lado)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {direccion.loteInicial || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {direccion.loteFinal || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="text-sm text-gray-500">
          Mostrando {direccionesFiltradas.length} de {direcciones.length} direcciones
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSeleccionar}
            disabled={!selectedDireccion}
          >
            Seleccionar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectorDirecciones;