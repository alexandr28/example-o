import React from 'react';
import { Select, Input, Button } from '../../components';

interface AlcabalaProps {
  aniosDisponibles: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tasa: number;
  onAnioChange: (anio: number | null) => void;
  onTasaChange: (tasa: number) => void;
  onRegistrar: () => void;
  loading?: boolean;
}

/**
 * Componente para capturar los datos de Alcabala
 */
const Alcabala: React.FC<AlcabalaProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  tasa,
  onAnioChange,
  onTasaChange,
  onRegistrar,
  loading = false
}) => {
  // Manejar cambio de año
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const anio = e.target.value ? parseInt(e.target.value) : null;
    onAnioChange(anio);
  };

  // Manejar cambio de tasa
  const handleTasaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaTasa = e.target.value ? parseFloat(e.target.value) : 0;
    onTasaChange(nuevaTasa);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Datos del alcabala</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          {/* Campo Tasa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa</label>
            <Input
              type="number"
              step="0.01"
              value={tasa}
              onChange={handleTasaChange}
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Botón Registrar */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onRegistrar}
            disabled={loading || !anioSeleccionado}
            className="w-full md:w-1/2 bg-green-400 hover:bg-green-500"
          >
            Registrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Alcabala;