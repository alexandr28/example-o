import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Button } from '../';
import { Barrio, Sector } from '../../models';

// Schema de validación para el formulario
const barrioSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  nombre: z.string().min(1, 'El nombre del barrio es requerido'),
});

type BarrioFormData = z.infer<typeof barrioSchema>;

interface BarrioFormProps {
  barrioSeleccionado?: Barrio | null;
  sectores: Sector[];
  onGuardar: (data: { nombre: string, sectorId: number }) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
}

const BarrioForm: React.FC<BarrioFormProps> = ({
  barrioSeleccionado,
  sectores,
  onGuardar,
  onNuevo,
  onEditar,
  loading = false,
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BarrioFormData>({
    resolver: zodResolver(barrioSchema),
    defaultValues: {
      sectorId: '',
      nombre: '',
    }
  });

  // Actualizar el formulario cuando se selecciona un barrio para editar
  useEffect(() => {
    if (barrioSeleccionado) {
      setValue('sectorId', barrioSeleccionado.sectorId.toString());
      setValue('nombre', barrioSeleccionado.nombre);
    }
  }, [barrioSeleccionado, setValue]);

  const onSubmit = (data: BarrioFormData) => {
    onGuardar({
      nombre: data.nombre,
      sectorId: parseInt(data.sectorId)
    });
    reset();
  };

  const handleNuevo = () => {
    reset();
    onNuevo();
  };

  // Convertir la lista de sectores al formato requerido para el componente Select
  const sectorOptions = sectores.map(sector => ({
    value: sector.id.toString(),
    label: sector.nombre
  }));

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Datos del barrio</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Sector"
            options={sectorOptions}
            error={errors.sectorId?.message}
            disabled={loading}
            placeholder="Ingrese nombre del sector"
            {...register('sectorId')}
          />
          
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            disabled={loading}
            placeholder="Ingrese nombre del barrio"
            {...register('nombre')}
          />
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
          >
            Guardar
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onEditar}
            disabled={loading}
          >
            Editar
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleNuevo}
            disabled={loading}
          >
            Nuevo
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BarrioForm;