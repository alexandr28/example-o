// src/context/FormContext.tsx - Versión corregida sin bucles infinitos
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface FormContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  clearUnsavedChanges: () => void;
  registerForm: (formId: string) => void;
  unregisterForm: (formId: string) => void;
  markFormAsDirty: (formId: string) => void;
  markFormAsClean: (formId: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    // En lugar de lanzar error, devolver un objeto vacío que no cause problemas
    return {
      hasUnsavedChanges: false,
      setHasUnsavedChanges: () => {},
      clearUnsavedChanges: () => {},
      registerForm: () => {},
      unregisterForm: () => {},
      markFormAsDirty: () => {},
      markFormAsClean: () => {},
    };
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set());
  const dirtyFormsRef = useRef(dirtyForms);

  // Actualizar la referencia cuando cambie el estado
  React.useEffect(() => {
    dirtyFormsRef.current = dirtyForms;
  }, [dirtyForms]);

  const hasUnsavedChanges = dirtyForms.size > 0;

  const setHasUnsavedChanges = useCallback((value: boolean) => {
    if (!value) {
      setDirtyForms(new Set());
    }
  }, []);

  const clearUnsavedChanges = useCallback(() => {
    setDirtyForms(new Set());
  }, []);

  const registerForm = useCallback((formId: string) => {
    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`Formulario registrado: ${formId}`);
    }
  }, []);

  const unregisterForm = useCallback((formId: string) => {
    setDirtyForms(prev => {
      const newSet = new Set(prev);
      newSet.delete(formId);
      return newSet;
    });
  }, []);

  const markFormAsDirty = useCallback((formId: string) => {
    setDirtyForms(prev => {
      // Solo actualizar si realmente cambió
      if (!prev.has(formId)) {
        const newSet = new Set(prev);
        newSet.add(formId);
        return newSet;
      }
      return prev;
    });
  }, []);

  const markFormAsClean = useCallback((formId: string) => {
    setDirtyForms(prev => {
      // Solo actualizar si realmente cambió
      if (prev.has(formId)) {
        const newSet = new Set(prev);
        newSet.delete(formId);
        return newSet;
      }
      return prev;
    });
  }, []);

  const value = React.useMemo(() => ({
    hasUnsavedChanges,
    setHasUnsavedChanges,
    clearUnsavedChanges,
    registerForm,
    unregisterForm,
    markFormAsDirty,
    markFormAsClean,
  }), [
    hasUnsavedChanges,
    setHasUnsavedChanges,
    clearUnsavedChanges,
    registerForm,
    unregisterForm,
    markFormAsDirty,
    markFormAsClean,
  ]);

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

// Hook personalizado para usar en componentes de formulario
export const useFormDirtyState = (formId: string) => {
  const { registerForm, unregisterForm, markFormAsDirty, markFormAsClean } = useFormContext();
  const isMountedRef = useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    registerForm(formId);
    
    return () => {
      isMountedRef.current = false;
      unregisterForm(formId);
    };
  }, [formId]); // Removemos las dependencias de las funciones para evitar re-renders

  const markAsDirty = useCallback(() => {
    if (isMountedRef.current) {
      markFormAsDirty(formId);
    }
  }, [formId, markFormAsDirty]);

  const markAsClean = useCallback(() => {
    if (isMountedRef.current) {
      markFormAsClean(formId);
    }
  }, [formId, markFormAsClean]);

  return {
    markAsDirty,
    markAsClean,
  };
};