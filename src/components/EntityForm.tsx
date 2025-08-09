// src/components/EntityForm.tsx - CORREGIDO PARA MANEJAR VALORES NULL
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Button } from './';

interface EntityFormProps<T> {
  title: string;
  schema: ZodSchema<T>;
  defaultValues: T;
  selectedItem?: any | null;
  onSave: (data: T) => void | Promise<void>;
  onNew: () => void;
  onEdit: () => void;
  loading?: boolean;
  isEditMode?: boolean;
  isOfflineMode?: boolean;
  children: (props: {
    register: any;
    errors: any;
    watch: any;
    setValue: any;
    formState: any;
  }) => React.ReactNode;
}

export function EntityForm<T extends Record<string, any>>({
  title,
  schema,
  defaultValues,
  selectedItem,
  onSave,
  onNew,
  onEdit,
  loading = false,
  isEditMode = false,
  isOfflineMode = false,
  children
}: EntityFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    watch
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const { errors, isDirty, isValid } = formState;

  // 🔥 FUNCIÓN HELPER PARA ASIGNAR VALORES DE FORMA SEGURA
  const safeSetValue = (key: string, value: any) => {
    try {
      if (value !== null && value !== undefined) {
        setValue(key as any, value);
        console.log(`✅ [EntityForm] Valor asignado - ${key}:`, value);
      } else {
        console.log(`⚠️ [EntityForm] Valor null/undefined para ${key}, manteniendo valor por defecto`);
      }
    } catch (error) {
      console.error(`❌ [EntityForm] Error al asignar valor ${key}:`, error);
    }
  };

  // 🔥 ACTUALIZAR FORMULARIO CON VALIDACIÓN MEJORADA
  useEffect(() => {
    console.log('🔄 [EntityForm] Actualizando formulario:', { selectedItem, isEditMode });
    
    if (selectedItem && typeof selectedItem === 'object') {
      console.log('📝 [EntityForm] selectedItem recibido:', selectedItem);
      
      // Iterar sobre las claves de defaultValues para mantener la estructura
      Object.keys(defaultValues).forEach(key => {
        if (selectedItem.hasOwnProperty(key)) {
          const value = selectedItem[key];
          console.log(`🔍 [EntityForm] Procesando ${key}:`, value, typeof value);
          
          // Validar que el valor no sea null antes de asignarlo
          if (value !== null && value !== undefined) {
            safeSetValue(key, value);
          } else {
            console.log(`⚠️ [EntityForm] Valor null para ${key}, usando valor por defecto`);
            safeSetValue(key, defaultValues[key as keyof T]);
          }
        } else {
          console.log(`⚠️ [EntityForm] Clave ${key} no encontrada en selectedItem`);
          // Asignar valor por defecto si la clave no existe
          safeSetValue(key, defaultValues[key as keyof T]);
        }
      });
    } else if (!selectedItem) {
      console.log('🧹 [EntityForm] Reseteando formulario con valores por defecto');
      reset(defaultValues);
    } else {
      console.warn('⚠️ [EntityForm] selectedItem no es un objeto válido:', selectedItem);
      reset(defaultValues);
    }
  }, [selectedItem, setValue, defaultValues, reset, isEditMode]);

  // 🔥 SUBMIT CON MEJOR MANEJO DE ERRORES
  const onSubmit = async (data: T) => {
    try {
      console.log('💾 [EntityForm] Enviando datos:', data);
      await onSave(data);
      
      // Solo resetear si no estamos en modo edición
      if (!isEditMode) {
        console.log('🧹 [EntityForm] Reseteando formulario después de guardar');
        reset(defaultValues);
      }
    } catch (error) {
      console.error('❌ [EntityForm] Error al guardar:', error);
      // Aquí podrías mostrar una notificación de error
    }
  };

  const handleNew = () => {
    console.log('🆕 [EntityForm] Nuevo elemento');
    reset(defaultValues);
    onNew();
  };

  // 🔥 VERIFICAR ESTADO DE FORMULARIO DE FORMA SEGURA
  const isFormDisabled = loading || (selectedItem && !isEditMode);
  const canSubmit = !loading && isDirty && isValid && (isEditMode || !selectedItem);

  // 🔥 LOGGING PARA DEBUG
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [EntityForm] Estado actual:', {
      title,
      selectedItem: selectedItem ? 'presente' : 'null',
      isEditMode,
      loading,
      isDirty,
      isValid,
      canSubmit,
      errorsCount: Object.keys(errors).length
    });
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
          {selectedItem && !isEditMode && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
              Modo vista
            </span>
          )}
          {isEditMode && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
              Modo edición
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isOfflineMode && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Modo sin conexión
            </span>
          )}
          {selectedItem && selectedItem.id && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              ID: {selectedItem.id}
            </span>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <fieldset disabled={isFormDisabled} className="space-y-6">
          {children({ register, errors, watch, setValue, formState })}
        </fieldset>
        
        <div className="flex justify-center space-x-4 mt-6">
          {!selectedItem || isEditMode ? (
            <>
              <Button 
                type="submit" 
                variant="primary"
                disabled={!canSubmit}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{isEditMode ? 'Actualizando...' : 'Guardando...'}</span>
                  </div>
                ) : (
                  isEditMode ? 'Actualizar' : 'Guardar'
                )}
              </Button>
              
              {isEditMode && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNew}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={onEdit}
              disabled={loading}
            >
              Editar
            </Button>
          )}
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleNew}
            disabled={loading}
          >
            Nuevo
          </Button>
        </div>
        
        {/* 🔥 INFORMACIÓN DE DEBUG EN DESARROLLO */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <details>
              <summary className="cursor-pointer font-medium">🔧 Debug EntityForm</summary>
              <div className="mt-2 space-y-1">
                <div>✅ canSubmit: {canSubmit ? 'true' : 'false'}</div>
                <div>📝 isDirty: {isDirty ? 'true' : 'false'}</div>
                <div>✔️ isValid: {isValid ? 'true' : 'false'}</div>
                <div>🔒 isFormDisabled: {isFormDisabled ? 'true' : 'false'}</div>
                <div>📊 selectedItem: {selectedItem ? 'presente' : 'null'}</div>
                <div>✏️ isEditMode: {isEditMode ? 'true' : 'false'}</div>
                {Object.keys(errors).length > 0 && (
                  <div className="text-red-600">
                    ❌ Errores: {Object.keys(errors).join(', ')}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
        
        {isOfflineMode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Los cambios se guardarán localmente mientras no haya conexión con el servidor.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}