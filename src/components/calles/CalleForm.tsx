// src/components/calles/CalleForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Button } from '../';
import { Calle } from '../../models';

// Schema de validación para el formulario
const calleSchema = z.object({
  tipoVia: z.string().min(1, 'Debe seleccionar un tipo de vía'),
  nombre: z.string().min(2, 'El nombre de la calle debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder los 100 caracteres'),
});

type CalleFormData = z.infer<typeof calleSchema>;

// Opciones para el selector de tipo de vía
const tipoViaOptions = [
  { value: 'avenida', label: 'Avenida' },
  { value: 'calle', label: 'Calle' },
  { value: 'jiron', label: 'Jirón' },
  { value: 'pasaje', label: 'Pasaje' },
  { value: 'malecon', label: 'Malecón' },
  { value: 'plaza', label: 'Plaza' },
  { value: 'parque', label: 'Parque' },
];

interface CalleFormProps {
  calleSeleccionada?: Calle | null;
  onGuardar: (data: CalleFormData) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
}

const CalleForm: React.FC<CalleFormProps> = ({
  calleSeleccionada,
  onGuardar,
  onNuevo,
  onEditar,
  loading = false,
}) => {
  const { register, handleSubmit, formState: { errors, isDirty, isValid }, reset, setValue } = useForm<CalleFormData>({
    resolver: zodResolver(calleSchema),
    defaultValues: {
      tipoVia: '',
      nombre: '',
    },
    mode: 'onChange' // Validar al cambiar los campos
  });

  // Estado para controlar el modo de formulario
  const [modoFormulario, setModoFormulario] = useState<'nuevo' | 'editar' | 'ver'>('nuevo');

  // Actualizar el formulario cuando se selecciona una calle para editar
  useEffect(() => {
    if (calleSeleccionada) {
      setValue('tipoVia', calleSeleccionada.tipoVia);
      setValue('nombre', calleSeleccionada.nombre);
      setModoFormulario('ver');
    } else {
      reset(); // Limpiar el formulario
      setModoFormulario('nuevo');
    }
  }, [calleSeleccionada, setValue, reset]);

  const onSubmit = (data: CalleFormData) => {
    onGuardar(data);
    reset();
    setModoFormulario('nuevo');
  };

  const handleNuevo = () => {
    reset();
    onNuevo();
    setModoFormulario('nuevo');
  };

  const handleEditarClick = () => {
    setModoFormulario('editar');
    onEditar();
  };

  const handleCancelar = () => {
    if (calleSeleccionada) {
      // Si estábamos editando, volver al modo visualización
      setValue('tipoVia', calleSeleccionada.tipoVia);
      setValue('nombre', calleSeleccionada.nombre);
      setModoFormulario('ver');
    } else {
      // Si estábamos creando, limpiar el formulario
      reset();
      setModoFormulario('nuevo');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          {modoFormulario === 'nuevo' ? 'Nueva calle' : 
           modoFormulario === 'editar' ? 'Editar calle' : 'Detalles de calle'}
        </h2>
        
        {modoFormulario === 'ver' && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
            ID: {calleSeleccionada?.id}
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Tipo de vía"
            options={tipoViaOptions}
            error={errors.tipoVia?.message}
            disabled={loading || modoFormulario === 'ver'}
            {...register('tipoVia')}
          />
          
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            disabled={loading || modoFormulario === 'ver'}
            placeholder="Ingrese nombre de la vía"
            {...register('nombre')}
          />
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          {modoFormulario === 'nuevo' && (
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || !isDirty || !isValid}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
          
          {modoFormulario === 'editar' && (
            <>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading || !isDirty || !isValid}
              >
                {loading ? 'Guardando...' : 'Actualizar'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelar}
                disabled={loading}
              >
                Cancelar
              </Button>
            </>
          )}
          
          {modoFormulario === 'ver' && (
            <Button
              type="button"
              variant="primary"
              onClick={handleEditarClick}
              disabled={loading}
            >
              Editar
            </Button>
          )}
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleNuevo}
            disabled={loading}
          >
            {modoFormulario === 'ver' ? 'Nueva calle' : 'Limpiar formulario'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CalleForm;