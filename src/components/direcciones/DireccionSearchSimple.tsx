// src/components/direcciones/DireccionSearchSimple.tsx
import React, { useState } from 'react';
import { Direccion } from '../../services/direccionService';

interface DireccionSearchSimpleProps {
  direccionSeleccionada: Direccion | null;
  onBuscar: (termino: string) => void;
  onLimpiar: () => void;
  loading?: boolean;
}

const DireccionSearchSimple: React.FC<DireccionSearchSimpleProps> = ({
  direccionSeleccionada,
  onBuscar,
  onLimpiar,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar(searchTerm);
  };

  const handleLimpiar = () => {
    setSearchTerm('');
    onLimpiar();
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Buscar Dirección</h2>
      
      {/* Dirección seleccionada */}
      {direccionSeleccionada && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Dirección Seleccionada:</h3>
              <p className="text-sm text-blue-800">
                {direccionSeleccionada.nombreTipoVia} {direccionSeleccionada.nombreVia} - 
                Cuadra {direccionSeleccionada.cuadra}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {direccionSeleccionada.nombreSector} - {direccionSeleccionada.nombreBarrio}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Lotes: {direccionSeleccionada.loteInicial} al {direccionSeleccionada.loteFinal}
              </p>
            </div>
            <button
              onClick={handleLimpiar}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por nombre de vía
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingrese el nombre de la vía..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              onClick={handleLimpiar}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
            >
              Limpiar
            </button>
          </div>
        </div>
      </form>

      {/* Información */}
      <div className="mt-4 text-sm text-gray-600">
        <p>• Ingrese al menos 1 carácter para buscar</p>
        <p>• La búsqueda se realiza por nombre de vía</p>
      </div>
    </div>
  );
};

export default DireccionSearchSimple;