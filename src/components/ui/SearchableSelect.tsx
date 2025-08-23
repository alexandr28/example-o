// src/components/ui/SearchableSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const SearchableSelect = React.forwardRef<HTMLInputElement, SearchableSelectProps>(
  ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    options,
    placeholder = 'Seleccione una opción',
    error,
    helperText,
    loading = false,
    disabled = false,
    required = false,
    className
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Obtener la opción seleccionada
    const selectedOption = options.find(opt => opt.value === value);

    // Filtrar opciones basado en el término de búsqueda
    const filteredOptions = options.filter(option => {
      // Verificar que option y option.label existen
      if (!option || !option.label) return false;
      
      // Convertir a string para asegurar que toLowerCase funcione
      const label = String(option.label).toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return label.includes(search);
    });

    // Manejar clic fuera del componente
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Manejar selección de opción
    const handleSelectOption = (option: SelectOption) => {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    };

    // Manejar teclado
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelectOption(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
      }
    };

    const inputClasses = clsx(
      'w-full px-2.5 border rounded',
      'focus:outline-none focus:ring-2',
      'text-xs h-[30px]', // Altura de 30px para coincidir con TextField y fuente pequeña
      {
        'border-red-500 focus:ring-red-500 focus:border-red-500': error,
        'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !error,
        'bg-gray-100 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled && !isOpen,
      },
      className
    );

    return (
      <div ref={containerRef} className="relative w-full searchable-select-container">
        {/* Label */}
        {label && (
          <label 
            htmlFor={id}
            className={clsx(
              'block text-xs font-medium mb-0.5',
              error ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input de búsqueda / Display */}
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            className={inputClasses}
            value={isOpen ? searchTerm : (selectedOption?.label || '')}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => !disabled && setIsOpen(true)}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            placeholder={!selectedOption ? placeholder : undefined}
            disabled={disabled || loading}
            required={required}
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          
          {/* Icono de flecha o loading */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {loading ? (
              <div className="animate-spin h-3 w-3 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            ) : (
              <svg
                className={clsx(
                  'h-4 w-4 text-gray-400 transition-transform',
                  isOpen && 'transform rotate-180'
                )}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown de opciones */}
        {isOpen && !disabled && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-auto">
            {loading ? (
              <div className="px-2.5 py-1.5 text-gray-500 text-center text-xs">
                Cargando opciones...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={clsx(
                    'px-2.5 py-1.5 cursor-pointer text-xs',
                    {
                      'bg-blue-500 text-white': index === highlightedIndex,
                      'hover:bg-gray-100': index !== highlightedIndex,
                      'bg-blue-100': option.value === value && index !== highlightedIndex,
                    }
                  )}
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-2.5 py-1.5 text-gray-500 text-center text-xs">
                No se encontraron opciones
              </div>
            )}
          </div>
        )}

        {/* Mensaje de error o helper */}
        {(error || helperText) && (
          <p 
            id={`${id}-${error ? 'error' : 'helper'}`} 
            className={clsx(
              'mt-0.5 text-xs',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}

        {/* Hidden input para react-hook-form */}
        <input
          ref={ref}
          type="hidden"
          value={value || ''}
          onChange={() => {}} // Manejado por el componente
        />
      </div>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';

export default SearchableSelect;