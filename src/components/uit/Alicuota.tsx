import React, { useState } from 'react';
import { Button,Input } from '../../components';
import { Alicuota } from '../../models/UIT';

interface AlicuotaProps {
  alicuotas: Alicuota[];
  onActualizarAlicuotas?: (alicuotas: Alicuota[]) => void;
  editable?: boolean;
  loading?: boolean;
}

/**
 * Componente para mostrar y editar las alícuotas (rangos y tasas)
 */
const AlicuotaComponent: React.FC<AlicuotaProps> = ({
  alicuotas,
  onActualizarAlicuotas,
  editable = false,
  loading = false
}) => {
  // Estado local para la edición de alícuotas
  const [editandoAlicuotas, setEditandoAlicuotas] = useState<Alicuota[]>(alicuotas);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Manejar cambio en una alícuota
  const handleAlicuotaChange = (id: number | undefined, tasa: number) => {
    if (modoEdicion) {
      const nuevasAlicuotas = editandoAlicuotas.map(a => 
        a.id === id ? { ...a, tasa } : a
      );
      setEditandoAlicuotas(nuevasAlicuotas);
    }
  };

  // Activar modo edición
  const activarEdicion = () => {
    setEditandoAlicuotas([...alicuotas]);
    setModoEdicion(true);
  };

  // Guardar cambios
  const guardarCambios = () => {
    if (onActualizarAlicuotas) {
      onActualizarAlicuotas(editandoAlicuotas);
    }
    setModoEdicion(false);
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoAlicuotas([...alicuotas]);
    setModoEdicion(false);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Lista de rangos y tasas</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {/* Tabla de alícuotas */}
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RANGO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ALÍCUOTA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(modoEdicion ? editandoAlicuotas : alicuotas).map((alicuota) => (
                  <tr key={alicuota.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alicuota.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {modoEdicion ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={alicuota.tasa}
                          onChange={(e) => handleAlicuotaChange(alicuota.id, parseFloat(e.target.value))}
                          className="border rounded px-2 py-1 w-20 text-center"
                        />
                      ) : (
                        <div className="bg-gray-200 px-4 py-2 rounded text-center">
                          {alicuota.tasa.toFixed(2)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Botones de acción */}
          {editable && (
            <div className="flex justify-center">
              {modoEdicion ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={guardarCambios}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Guardar
                  </Button>
                  <Button
                    onClick={cancelarEdicion}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={activarEdicion}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Cambiar tasas
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlicuotaComponent;