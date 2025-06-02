// src/components/ui/Select.tsx - MEJORADO CON DEBUG
import React from 'react';
import classNames from 'classnames';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder = 'Seleccione',
  fullWidth = true,
  className,
  onChange,
  value,
  ...props
}) => {
  // Manejar cambios y logging
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    
    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 [Select ${label}] Cambio:`, {
        valorAnterior: value,
        valorNuevo: newValue,
        opciones: options.length
      });
    }
    
    // Llamar al onChange original
    if (onChange) {
      onChange(e);
    }
  };

  // Verificar si el valor actual está en las opciones
  const isValidValue = value && options.some(option => option.value === value);
  
  // Log de estado en desarrollo
  if (process.env.NODE_ENV === 'development') {
    React.useEffect(() => {
      console.log(`🔍 [Select ${label}] Estado:`, {
        value: value || '(vacío)',
        options: options.length,
        isValidValue,
        opciones: options.map(o => ({ value: o.value, label: o.label }))
      });
    }, [value, options.length, isValidValue]);
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="label">
          {label}
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-gray-400 ml-1">
              [{options.length} opciones]
            </span>
          )}
        </label>
      )}
      
      <select
        className={classNames(
          'input',
          {
            'input-error': !!error,
            'border-green-300': isValidValue && !error, // Borde verde si tiene valor válido
          },
          className
        )}
        onChange={handleChange}
        value={value || ''} // Asegurar que siempre tenga un valor
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-1 rounded">
          <div>📊 Valor actual: "{value || '(vacío)'}"</div>
          <div>📊 Opciones: {options.length}</div>
          <div>📊 Valor válido: {isValidValue ? '✅' : '❌'}</div>
          {!isValidValue && value && (
            <div className="text-red-500">
              ⚠️ El valor "{value}" no está en las opciones disponibles
            </div>
          )}
        </div>
      )}
      
      {/* Mostrar opciones disponibles en desarrollo */}
      {process.env.NODE_ENV === 'development' && options.length > 0 && (
        <details className="text-xs text-gray-500 mt-1">
          <summary>🔍 Ver opciones disponibles ({options.length})</summary>
          <div className="bg-gray-50 p-2 mt-1 rounded max-h-20 overflow-y-auto">
            {options.map((option, index) => (
              <div key={option.value} className={value === option.value ? 'font-bold text-green-600' : ''}>
                {index + 1}. "{option.value}" → {option.label}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default Select;