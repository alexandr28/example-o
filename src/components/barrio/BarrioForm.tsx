// src/components/barrio/BarrioForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';
import { BarrioFormData } from '../../models/Barrio';
import { useSectores } from '../../hooks/useSectores';

// Esquema de validación con tipo explícito
const schema = yup.object().shape({
  nombre: yup
    .string()
    .trim()
    .required('El nombre del barrio es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .default(''),
  codSector: yup
    .number()
    .positive('Debe seleccionar un sector')
    .integer()
    .required('El sector es requerido')
    .typeError('Debe seleccionar un sector válido')
    .default(0)
});

interface BarrioFormProps {
  onSubmit: (data: BarrioFormData) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Partial<BarrioFormData>;
  isSubmitting?: boolean;
}

const BarrioForm: React.FC<BarrioFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  // Hook para obtener sectores
  const { sectores, cargarSectores } = useSectores();
  
  // Configurar react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control
  } = useForm<BarrioFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      codSector: initialData?.codSector || 0
    },
    mode: 'onChange'
  });

  // Cargar sectores al montar
  useEffect(() => {
    cargarSectores();
  }, [cargarSectores]);

  // Observar cambios en el formulario para debug
  const formValues = watch();
  
  useEffect(() => {
    console.log('📝 [BarrioForm] Valores del formulario:', formValues);
  }, [formValues]);

  // Manejar envío del formulario
  const onFormSubmit = async (data: BarrioFormData) => {
    try {
      console.log('📤 [BarrioForm] Enviando datos:', data);
      
      // Asegurar que los datos tengan el formato correcto
      const datosFormateados: BarrioFormData = {
        nombre: data.nombre?.trim() || '',
        codSector: Number(data.codSector) || 0
      };
      
      await onSubmit(datosFormateados);
    } catch (error) {
      console.error('❌ [BarrioForm] Error al enviar:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
      {/* Campo Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-xs font-medium text-gray-700 mb-1">
          Nombre del Barrio <span className="text-red-500">*</span>
        </label>
        <Input
          id="nombre"
          type="text"
          placeholder="Ingrese el nombre del barrio"
          {...register('nombre')}
          error={errors.nombre?.message}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
      </div>

      {/* Campo Sector con SearchableSelect */}
      <div>
        <label htmlFor="codSector" className="block text-xs font-medium text-gray-700 mb-1">
          Sector <span className="text-red-500">*</span>
        </label>
        <Controller
          name="codSector"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="codSector"
              name={field.name}
              value={field.value}
              onChange={(value) => {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                field.onChange(numValue);
              }}
              onBlur={field.onBlur}
              options={sectores.map(sector => ({
                value: sector.id,
                label: sector.nombre
              }))}
              placeholder="Buscar y seleccionar un sector"
              error={errors.codSector?.message}
              disabled={isSubmitting || sectores.length === 0}
              required
              className="h-9 text-sm"
            />
          )}
        />
        {sectores.length === 0 && !isSubmitting && (
          <p className="text-xs text-gray-500 mt-1">
            No hay sectores disponibles. Debe crear un sector primero.
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-8 px-3 text-sm"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || sectores.length === 0}
          className="h-8 px-3 text-sm"
        >
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};

export default BarrioForm;