// src/components/debug/SectorSelectTest.tsx
import React, { useState } from 'react';
import { useSectores } from '../../hooks/useSectores';

const SectorSelectTest: React.FC = () => {
  const { sectores } = useSectores();
  const [selectedValue, setSelectedValue] = useState<string>('');
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Valor seleccionado:', value);
    setSelectedValue(value);
  };
  
  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded">
      <h4 className="font-bold mb-2">🧪 Test de Select de Sectores</h4>
      
      <select 
        value={selectedValue} 
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">-- Seleccione --</option>
        {sectores.map(sector => (
          <option key={sector.id} value={sector.id.toString()}>
            ID: {sector.id} - {sector.nombre}
          </option>
        ))}
      </select>
      
      <div className="mt-2 text-sm">
        <p>Valor actual: <strong>{selectedValue || 'ninguno'}</strong></p>
        <p>Tipo: <strong>{typeof selectedValue}</strong></p>
        <p>Total sectores: <strong>{sectores.length}</strong></p>
      </div>
      
      {selectedValue && (
        <div className="mt-2 p-2 bg-green-100 rounded">
          Sector seleccionado: {sectores.find(s => s.id.toString() === selectedValue)?.nombre}
        </div>
      )}
    </div>
  );
};

export default SectorSelectTest;