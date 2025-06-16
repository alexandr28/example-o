// src/components/ui/Select.tsx - CORREGIDO PARA MANEJAR VALORES CORRECTAMENTE
import React, { forwardRef } from 'react';
import classNames from 'classnames';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  placeholder = 'Seleccione',
  fullWidth = true,
  className,
  onChange,
  value,
  name,
  ...props
}, ref) => {
  // 🔥 MANEJAR CAMBIOS CON LOGGING MEJORADO
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    
    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 [Select ${label || name}] Cambio detectado:`, {
        valorAnterior: value,
        valorNuevo: newValue,
        opciones: options.length,
        opcionSeleccionada: options.find(opt => opt.value === newValue)
      });
    }
    
    // Llamar al onChange original
    if (onChange) {
      onChange(e);
    }
  };

  // 🔥 VERIFICAR SI EL VALOR ACTUAL ESTÁ EN LAS OPCIONES
  const currentValue = value || '';
  const isValidValue = currentValue && options.some(option => option.value === currentValue);
  const selectedOption = options.find(opt => opt.value === currentValue);
  
  // Log de estado en desarrollo
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [Select ${label || name}] Estado actualizado:`, {
        currentValue: currentValue || '(vacío)',
        options: options.length,
        isValidValue,
        selectedOption: selectedOption?.label || 'ninguna',
        primerasOpciones: options.slice(0, 3).map(o => ({ value: o.value, label: o.label }))
      });
    }
  }, [currentValue, options.length, isValidValue, selectedOption, label, name]);

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
        ref={ref}
        name={name}
        className={classNames(
          'input',
          {
            'input-error': !!error,
            'border-green-300 bg-green-50': isValidValue && !error, // Borde verde si tiene valor válido
            'border-gray-300': !isValidValue && !error,
          },
          className
        )}
        onChange={handleChange}
        value={currentValue} // 🔥 USAR currentValue EN LUGAR DE value || ''
        {...props}
      >
        {/* 🔥 OPCIÓN PLACEHOLDER MEJORADA */}
        <option value="" disabled={!!currentValue}>
          {options.length === 0 ? 'Sin opciones disponibles' : placeholder}
        </option>
        
        {/* 🔥 RENDERIZAR OPCIONES CON VERIFICACIÓN */}
        {options.map((option) => (
          <option 
            key={`${option.value}-${option.label}`} 
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {/* 🔥 DEBUG INFO MEJORADA EN DESARROLLO */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded border">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">📊 Valor actual:</span> 
              <span className={currentValue ? 'text-green-600 font-medium' : 'text-red-500'}>
                "{currentValue || '(vacío)'}"
              </span>
            </div>
            <div>
              <span className="font-medium">📊 Opciones:</span> 
              <span className="text-blue-600">{options.length}</span>
            </div>
            <div>
              <span className="font-medium">📊 Valor válido:</span> 
              <span className={isValidValue ? 'text-green-600' : 'text-red-500'}>
                {isValidValue ? '✅' : '❌'}
              </span>
            </div>
            <div>
              <span className="font-medium">📊 Seleccionada:</span> 
              <span className="text-purple-600">
                {selectedOption?.label || 'ninguna'}
              </span>
            </div>
          </div>
          
          {/* 🔥 ALERTA SI EL VALOR NO ESTÁ EN LAS OPCIONES */}
          {!isValidValue && currentValue && options.length > 0 && (
            <div className="text-red-500 mt-1 p-1 bg-red-50 rounded">
              ⚠️ El valor "{currentValue}" no está en las opciones disponibles
            </div>
          )}
          
          {/* 🔥 MOSTRAR PRIMERAS OPCIONES PARA DEBUG */}
          {options.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-600">
                🔍 Ver primeras opciones ({Math.min(options.length, 5)})
              </summary>
              <div className="mt-1 bg-white p-1 rounded border max-h-20 overflow-y-auto">
                {options.slice(0, 5).map((option, index) => (
                  <div 
                    key={option.value} 
                    className={`text-xs ${currentValue === option.value ? 'font-bold text-green-600 bg-green-50' : ''} p-1 rounded`}
                  >
                    {index + 1}. "{option.value}" → {option.label}
                    {currentValue === option.value && ' ⭐ SELECCIONADO'}
                  </div>
                ))}
                {options.length > 5 && (
                  <div className="text-xs text-gray-400 italic">
                    ... y {options.length - 5} opciones más
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
});

// Nombre para DevTools
Select.displayName = 'Select';

export default Select;