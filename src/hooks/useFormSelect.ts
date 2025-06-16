// src/hooks/useFormSelect.ts - HOOK PARA MANEJAR SELECTS EN FORMULARIOS
import { useCallback, useEffect } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface UseFormSelectOptions {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  fieldName: string;
  options: Array<{ value: string; label: string }>;
  onValueChange?: (value: string) => void;
  resetDependentFields?: string[];
  debugName?: string;
}

export const useFormSelect = ({
  setValue,
  watch,
  fieldName,
  options,
  onValueChange,
  resetDependentFields = [],
  debugName
}: UseFormSelectOptions) => {
  const currentValue = watch(fieldName);
  
  // 🔥 VERIFICAR SI EL VALOR ACTUAL ES VÁLIDO
  const isValidValue = useCallback(() => {
    if (!currentValue || currentValue === '') return false;
    return options.some(option => option.value === currentValue);
  }, [currentValue, options]);

  // 🔥 MANEJAR CAMBIO DE VALOR
  const handleValueChange = useCallback((newValue: string) => {
    console.log(`🔄 [useFormSelect ${debugName || fieldName}] Cambio de valor:`, {
      anterior: currentValue,
      nuevo: newValue,
      esValido: options.some(opt => opt.value === newValue)
    });
    
    // Asignar el nuevo valor
    setValue(fieldName, newValue);
    
    // Resetear campos dependientes si el valor cambió
    if (newValue !== currentValue && resetDependentFields.length > 0) {
      console.log(`🧹 [useFormSelect ${debugName || fieldName}] Reseteando campos dependientes:`, resetDependentFields);
      resetDependentFields.forEach(dependentField => {
        setValue(dependentField, '');
      });
    }
    
    // Llamar callback personalizado
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [currentValue, setValue, fieldName, resetDependentFields, onValueChange, options, debugName]);

  // 🔥 CORREGIR VALOR SI NO ES VÁLIDO CUANDO CAMBIAN LAS OPCIONES
  useEffect(() => {
    if (currentValue && !isValidValue()) {
      console.warn(`⚠️ [useFormSelect ${debugName || fieldName}] Valor "${currentValue}" no está en las opciones disponibles, reseteando`);
      setValue(fieldName, '');
    }
  }, [options, currentValue, isValidValue, setValue, fieldName, debugName]);

  // 🔥 LOG DE ESTADO EN DESARROLLO
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [useFormSelect ${debugName || fieldName}] Estado:`, {
        currentValue: currentValue || '(vacío)',
        isValid: isValidValue(),
        optionsCount: options.length,
        primerasOpciones: options.slice(0, 3)
      });
    }
  }, [currentValue, options, isValidValue, fieldName, debugName]);

  return {
    currentValue: currentValue || '',
    isValidValue: isValidValue(),
    handleValueChange,
    options,
    isEmpty: !currentValue || currentValue === ''
  };
};