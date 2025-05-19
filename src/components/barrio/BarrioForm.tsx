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
  error?: string | null;
}

const BarrioForm: React.FC<BarrioFormProps> = ({
  barrioSeleccionado,
  sectores,
  onGuardar,
  onNuevo,
  onEditar,
  loading = false,
  error = null
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<BarrioFormData>({
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

  // Valor actual del sector seleccionado para mostrar detalles
  const sectorIdSelected = watch('sectorId');
  const sectorSeleccionado = sectores.find(s => s.id.toString() === sectorIdSelected);

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Datos del barrio</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Mostrar errores si hay */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Sector"
            options={sectorOptions}
            error={errors.sectorId?.message as string}
            disabled={loading}
            placeholder="Seleccione un sector"
            {...register('sectorId')}
          />
          
          <Input
            label="Nombre"
            error={errors.nombre?.message as string}
            disabled={loading}
            placeholder="Ingrese nombre del barrio"
            {...register('nombre')}
          />
        </div>
        
        {/* Mostrar información del sector seleccionado si existe */}
        {sectorSeleccionado && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              El barrio pertenecerá al sector: <strong>{sectorSeleccionado.nombre}</strong>
            </p>
          </div>
        )}
        
        <div className="flex justify-center space-x-4 mt-6">
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </div>
            ) : "Guardar"}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onEditar}
            disabled={loading || !barrioSeleccionado}
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