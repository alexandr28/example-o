// src/components/ui/Select.tsx - VERSIÓN MEJORADA
import React, { forwardRef, useCallback } from 'react';
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
  disabled,
  ...props
}, ref) => {
  
  // Manejar el cambio del select
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    
    console.log(`🔄 [Select ${name || label}] onChange:`, {
      name,
      oldValue: value,
      newValue,
      event: e
    });
    
    // Llamar al onChange si existe
    if (onChange) {
      onChange(e);
    }
  }, [onChange, value, name, label]);

  // Verificar si el valor actual es válido
  const currentValue = value || '';
  const isValidValue = options.some(option => option.value === currentValue);
  
  // Log para debug
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 [Select ${name || label}] Estado:`, {
        name,
        value: currentValue,
        isValidValue,
        optionsCount: options.length,
        disabled,
        hasOnChange: !!onChange
      });
    }
  }, [currentValue, isValidValue, options.length, disabled, onChange, name, label]);

  const selectClasses = classNames(
    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
    {
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !error && !disabled,
      'border-red-300 focus:ring-red-500 focus:border-red-500': error && !disabled,
      'bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
      'bg-white cursor-pointer': !disabled,
    },
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-gray-400 ml-2">
              ({options.length} opciones)
            </span>
          )}
        </label>
      )}
      
      <select
        ref={ref}
        id={name}
        name={name}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {/* Opción de placeholder */}
        <option value="">
          {placeholder}
        </option>
        
        {/* Opciones */}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-1 text-xs text-gray-500">
          Valor: "{currentValue}" | Válido: {isValidValue ? '✅' : '❌'}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;