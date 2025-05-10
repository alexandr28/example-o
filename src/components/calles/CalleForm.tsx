import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Button } from '../';

// Schema de validación para el formulario
const calleSchema = z.object({
  tipoVia: z.string().min(1, 'Debe seleccionar un tipo de vía'),
  nombre: z.string().min(1, 'El nombre de la calle es requerido'),
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

interface Calle {
  id?: number;
  tipoVia: string;
  nombre: string;
}

interface CalleFormProps {
  calleSeleccionada?: Calle | null;
  onGuardar: (data: CalleFormData) => void;
  onNuevo: () => void;
  onEditar: () => void;
}

const CalleForm: React.FC<CalleFormProps> = ({
  calleSeleccionada,
  onGuardar,
  onNuevo,
  onEditar,
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CalleFormData>({
    resolver: zodResolver(calleSchema),
    defaultValues: {
      tipoVia: '',
      nombre: '',
    }
  });

  // Actualizar el formulario cuando se selecciona una calle para editar
  useEffect(() => {
    if (calleSeleccionada) {
      setValue('tipoVia', calleSeleccionada.tipoVia);
      setValue('nombre', calleSeleccionada.nombre);
    }
  }, [calleSeleccionada, setValue]);

  const onSubmit = (data: CalleFormData) => {
    onGuardar(data);
    reset();
  };

  const handleNuevo = () => {
    reset();
    onNuevo();
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Datos de la calle</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Tipo de vía"
            options={tipoViaOptions}
            error={errors.tipoVia?.message}
            {...register('tipoVia')}
          />
          
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            {...register('nombre')}
          />
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          <Button type="submit" variant="primary">
            Guardar
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onEditar}
          >
            Editar
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleNuevo}
          >
            Nuevo
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CalleForm;