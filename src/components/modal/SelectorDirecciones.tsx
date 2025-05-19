import React, { useState } from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import { Direccion, DireccionSeleccionadaModalProps } from '../../types';

const SelectorDirecciones: React.FC<DireccionSeleccionadaModalProps> = ({
  isOpen,
  onClose,
  onSelectDireccion,
  direcciones,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);

  const filteredDirecciones = direcciones.filter(direccion =>
    direccion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleConfirmSelection = () => {
    if (selectedDireccion) {
      onSelectDireccion(selectedDireccion);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selector de direcciones" size="lg">
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Buscar dirección"
          className="input pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dirección
                <span className="ml-1">▼</span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lado
                <span className="ml-1">▼</span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lote Inicial
                <span className="ml-1">▼</span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lote Final
                <span className="ml-1">▼</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDirecciones.map((direccion) => (
              <tr 
                key={direccion.id} 
                className={selectedDireccion?.id === direccion.id ? 'bg-blue-50' : 'hover:bg-gray-50 cursor-pointer'}
                onClick={() => handleSelect(direccion)}
              >
                <td className="px-6 py-4 whitespace-nowrap">{direccion.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap">{direccion.lado}</td>
                <td className="px-6 py-4 whitespace-nowrap">{direccion.loteInicial}</td>
                <td className="px-6 py-4 whitespace-nowrap">{direccion.loteFinal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Button 
          onClick={handleConfirmSelection} 
          disabled={!selectedDireccion}
          className="w-40"
        >
          Seleccionar
        </Button>
      </div>
    </Modal>
  );
};

export default SelectorDirecciones;