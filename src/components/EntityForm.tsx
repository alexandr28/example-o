// src/components/generic/EntityForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import {Button} from './';

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

  // Actualizar formulario cuando cambia el elemento seleccionado
  useEffect(() => {
    if (selectedItem) {
      Object.keys(defaultValues).forEach(key => {
        if (selectedItem[key] !== undefined) {
          setValue(key as any, selectedItem[key]);
        }
      });
    } else {
      reset(defaultValues);
    }
  }, [selectedItem, setValue, defaultValues, reset]);

  const onSubmit = async (data: T) => {
    try {
      await onSave(data);
      if (!isEditMode) {
        reset(defaultValues);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleNew = () => {
    reset(defaultValues);
    onNew();
  };

  const isFormDisabled = loading || (selectedItem && !isEditMode);

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
          {selectedItem && (
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
                disabled={loading || !isDirty || !isValid}
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