import React from 'react';
import { Select, Input, Button } from '../../components';

interface UITProps {
  aniosDisponibles: { value: string, label: string }[];
  anioSeleccionado: number | null;
  montoCalculo: number;
  onAnioChange: (anio: number | null) => void;
  onMontoChange: (monto: number) => void;
  onCalcular: () => void;
  loading?: boolean;
}

/**
 * Componente para capturar los datos de cálculo de UIT
 */
const UIT: React.FC<UITProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  montoCalculo,
  onAnioChange,
  onMontoChange,
  onCalcular,
  loading = false
}) => {
  // Manejar cambio de año
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const anio = e.target.value ? parseInt(e.target.value) : null;
    onAnioChange(anio);
  };

  // Manejar cambio de monto
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monto = e.target.value ? parseFloat(e.target.value) : 0;
    onMontoChange(monto);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Unidad Impositiva Tributaria</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
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
          
          {/* Campo Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <Input
              type="number"
              value={montoCalculo || ''}
              onChange={handleMontoChange}
              disabled={loading}
              placeholder="Ingresar monto"
            />
          </div>
          
          {/* Botón Calcular */}
          <div>
            <Button
              onClick={onCalcular}
              disabled={loading || !anioSeleccionado || montoCalculo <= 0}
              className="w-full bg-green-400 hover:bg-green-500"
            >
              Calcular
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIT;