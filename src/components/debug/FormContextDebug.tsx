// src/components/debug/FormContextDebug.tsx
import React from 'react';
import { useFormContext } from '../../context/FormContex';

export const FormContextDebug: React.FC = () => {
  const { hasUnsavedChanges } = useFormContext();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔍 FormContext Debug</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span>Cambios sin guardar:</span>
          <span className={`font-bold ${hasUnsavedChanges ? 'text-yellow-400' : 'text-green-400'}`}>
            {hasUnsavedChanges ? 'SÍ ⚠️' : 'NO ✅'}
          </span>
        </div>
        <div className="text-gray-400 mt-2">
          {hasUnsavedChanges && 'La navegación mostrará confirmación'}
        </div>
      </div>
    </div>
  );
};

export default FormContextDebug;