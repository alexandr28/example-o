import React from 'react';
import { Select, Input, Button } from '../../components';

interface DepreciacionProps {
  aniosDisponibles: { value: string, label: string }[];
  tiposCasa: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tipoCasaSeleccionado: string | null;
  onAnioChange: (anio: number | null) => void;
  onTipoCasaChange: (tipoCasa: string | null) => void;
  onRegistrar: () => void;
  loading?: boolean;
}

/**
 * Componente para capturar los datos de depreciación
 */
const Depreciacion: React.FC<DepreciacionProps> = ({
  aniosDisponibles,
  tiposCasa,
  anioSeleccionado,
  tipoCasaSeleccionado,
  onAnioChange,
  onTipoCasaChange,
  onRegistrar,
  loading = false
}) => {
  // Manejar cambio de año
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const anio = e.target.value ? parseInt(e.target.value) : null;
    onAnioChange(anio);
  };

  // Manejar cambio de tipo de casa
  const handleTipoCasaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipoCasa = e.target.value || null;
    onTipoCasaChange(tipoCasa);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Datos de depreciación</h2>
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
          
          {/* Campo Tipo de Casa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipos de casa</label>
            <Select
              options={tiposCasa}
              value={tipoCasaSeleccionado || ''}
              onChange={handleTipoCasaChange}
              disabled={loading}
              placeholder="Seleccione"
            />
          </div>
        </div>
        
        {/* Estados de conservación */}
        <div className="mt-6">
          <div className="block text-sm font-medium text-gray-700 mb-2">Estados de conservación</div>
          <div className="border rounded-md p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Muy bueno</label>
                <Input
                  type="number"
                  step="0.01"
                  value="0.00"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bueno</label>
                <Input
                  type="number"
                  step="0.01"
                  value="0.00"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular</label>
                <Input
                  type="number"
                  step="0.01"
                  value="0.00"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Malo</label>
                <Input
                  type="number"
                  step="0.01"
                  value="0.00"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón Registrar */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onRegistrar}
            disabled={loading || !anioSeleccionado || !tipoCasaSeleccionado}
            className="w-full md:w-1/2 bg-green-400 hover:bg-green-500"
          >
            Registrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Depreciacion;