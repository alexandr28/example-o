import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '../';

// Schema de validación para el formulario
const sectorSchema = z.object({
  nombre: z.string().min(1, 'El nombre del sector es requerido'),
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface Sector {
  id?: number;
  nombre: string;
}

interface SectorFormProps {
  sectorSeleccionado?: Sector | null;
  onGuardar: (data: SectorFormData) => void;
  onNuevo: () => void;
  onEditar: () => void;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sectorSeleccionado,
  onGuardar,
  onNuevo,
  onEditar,
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      nombre: '',
    }
  });

  // Actualizar el formulario cuando se selecciona un sector para editar
  useEffect(() => {
    if (sectorSeleccionado) {
      setValue('nombre', sectorSeleccionado.nombre);
    }
  }, [sectorSeleccionado, setValue]);

  const onSubmit = (data: SectorFormData) => {
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
        <h2 className="text-lg font-medium text-gray-800">Datos del sector</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            {...register('nombre')}
            placeholder="Ingrese nombre del sector"
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

export default SectorForm;