// src/components/debug/TestSelect.tsx
import React, { useState } from 'react';

const TestSelect: React.FC = () => {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  const options = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ];

  return (
    <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500 z-50">
      <h3 className="font-bold text-sm mb-2">🧪 Test Select</h3>
      
      {/* Select nativo HTML */}
      <div className="mb-3">
        <label className="text-xs font-bold">Select HTML Nativo:</label>
        <select 
          value={value1} 
          onChange={(e) => {
            console.log('Select nativo cambió:', e.target.value);
            setValue1(e.target.value);
          }}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="">Seleccione...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="text-xs mt-1">Valor: "{value1}"</div>
      </div>

      {/* Probar eventos */}
      <div className="mb-3">
        <label className="text-xs font-bold">Test con logs:</label>
        <select 
          value={value2}
          onChange={(e) => {
            console.log('🔵 onChange disparado');
            console.log('Target:', e.target);
            console.log('Value:', e.target.value);
            console.log('Selected Index:', e.target.selectedIndex);
            setValue2(e.target.value);
          }}
          onInput={(e) => console.log('🟢 onInput:', (e.target as HTMLSelectElement).value)}
          onClick={(e) => console.log('🟡 onClick')}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="">Seleccione...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="text-xs mt-1">Valor: "{value2}"</div>
      </div>

      <button
        onClick={() => {
          setValue1('');
          setValue2('');
        }}
        className="text-xs bg-red-500 text-white px-2 py-1 rounded"
      >
        Limpiar
      </button>
    </div>
  );
};

export default TestSelect;