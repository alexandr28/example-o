// src/hooks/useFormWrapper.ts - Versión corregida
import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useFormDirtyState } from '../context/FormContex';

interface UseFormWrapperOptions {
  formId: string;
  form: UseFormReturn<any>;
}

/**
 * Hook que integra react-hook-form con el FormContext
 * para manejar el estado de cambios sin guardar
 */
export const useFormWrapper = ({ formId, form }: UseFormWrapperOptions) => {
  const { markAsDirty, markAsClean } = useFormDirtyState(formId);
  const { formState: { isDirty } } = form;
  const prevIsDirtyRef = useRef(isDirty);

  // Observar cambios en el estado isDirty del formulario
  useEffect(() => {
    // Solo actualizar si realmente cambió el estado
    if (prevIsDirtyRef.current !== isDirty) {
      prevIsDirtyRef.current = isDirty;
      
      if (isDirty) {
        markAsDirty();
      } else {
        markAsClean();
      }
    }
  }, [isDirty]); // Solo depender de isDirty

  // Limpiar el estado al desmontar el componente
  useEffect(() => {
    return () => {
      markAsClean();
    };
  }, []); // Array vacío para ejecutar solo al montar/desmontar

  return {
    ...form,
    // Función auxiliar para marcar como limpio después de guardar
    markSaved: () => {
      form.reset(form.getValues());
      markAsClean();
    }
  };
};