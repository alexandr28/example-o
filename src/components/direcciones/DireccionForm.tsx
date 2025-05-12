import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Select, Button } from '../';
import { Direccion, Sector, Barrio, Calle, LadoDireccion } from '../../models';

// El problema parece estar en la transformación, vamos a simplificar el esquema
const direccionSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  barrioId: z.string().min(1, 'Debe seleccionar un barrio'),
  calleId: z.string().min(1, 'Debe seleccionar una calle'),
  cuadra: z.string().min(1, 'La cuadra es requerida'),
  lado: z.string(),
  // En lugar de transformar, mantenemos como string y convertimos manualmente después
  loteInicial: z.string().refine(val => !isNaN(Number(val)), {
    message: 'Debe ser un número'
  }),
  loteFinal: z.string().refine(val => !isNaN(Number(val)), {
    message: 'Debe ser un número'
  }),
}).refine(data => {
  const loteInicial = Number(data.loteInicial);
  const loteFinal = Number(data.loteFinal);
  return loteInicial <= loteFinal;
}, {
  message: 'El lote inicial debe ser menor o igual al lote final',
  path: ['loteInicial']
});

type FormValues = z.infer<typeof direccionSchema>;

interface DireccionFormProps {
  direccionSeleccionada?: Direccion | null;
  sectores: Sector[];
  barrios: Barrio[];
  calles: Calle[];
  lados: { value: string, label: string }[];
  sectorSeleccionado: number | null;
  onSectorChange: (sectorId: number) => void;
  onGuardar: (data: any) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
}

const DireccionForm: React.FC<DireccionFormProps> = ({
  direccionSeleccionada,
  sectores,
  barrios,
  calles,
  lados,
  sectorSeleccionado,
  onSectorChange,
  onGuardar,
  onNuevo,
  onEditar,
  loading = false,
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(direccionSchema),
    defaultValues: {
      sectorId: '',
      barrioId: '',
      calleId: '',
      cuadra: '',
      lado: LadoDireccion.NINGUNO,
      loteInicial: '0',
      loteFinal: '0',
    }
  });

  // Observar el campo de sector para filtrar barrios
  const watchedSectorId = watch('sectorId');
  
  // Estado local para barrios filtrados
  const [barriosFiltrados, setBarriosFiltrados] = useState<Barrio[]>([]);

  // Filtrar barrios cuando cambia el sector
  useEffect(() => {
    if (watchedSectorId) {
      const sectorId = parseInt(watchedSectorId);
      const filtrados = barrios.filter(barrio => barrio.sectorId === sectorId);
      setBarriosFiltrados(filtrados);
      onSectorChange(sectorId);
    } else {
      setBarriosFiltrados([]);
    }
  }, [watchedSectorId, barrios, onSectorChange]);

  // Actualizar el formulario cuando se selecciona una dirección para editar
  useEffect(() => {
    if (direccionSeleccionada) {
      setValue('sectorId', direccionSeleccionada.sectorId.toString());
      setValue('barrioId', direccionSeleccionada.barrioId.toString());
      setValue('calleId', direccionSeleccionada.calleId.toString());
      setValue('cuadra', direccionSeleccionada.cuadra);
      setValue('lado', direccionSeleccionada.lado);
      setValue('loteInicial', direccionSeleccionada.loteInicial.toString());
      setValue('loteFinal', direccionSeleccionada.loteFinal.toString());
    }
  }, [direccionSeleccionada, setValue]);

  const onSubmit = (data: FormValues) => {
    // Convertimos manualmente a los tipos correctos
    const formattedData = {
      sectorId: parseInt(data.sectorId),
      barrioId: parseInt(data.barrioId),
      calleId: parseInt(data.calleId),
      cuadra: data.cuadra,
      lado: data.lado,
      loteInicial: parseInt(data.loteInicial),
      loteFinal: parseInt(data.loteFinal),
    };
    
    onGuardar(formattedData);
    reset();
  };

  const handleNuevo = () => {
    reset();
    onNuevo();
  };

  // Convertir las listas al formato requerido para el componente Select
  const sectorOptions = sectores.map(sector => ({
    value: sector.id.toString(),
    label: sector.nombre
  }));

  const barrioOptions = barriosFiltrados.map(barrio => ({
    value: barrio.id.toString(),
    label: barrio.nombre
  }));

  const calleOptions = calles.map(calle => ({
    value: calle.id.toString(),
    label: `${calle.tipoVia === 'avenida' ? 'Av. ' : calle.tipoVia === 'jiron' ? 'Jr. ' : 'Calle '}${calle.nombre}`
  }));

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Datos de la dirección</h2>
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
          
          <Select
            label="Barrio"
            options={barrioOptions}
            error={errors.barrioId?.message}
            disabled={loading || !watchedSectorId}
            placeholder="Ingrese nombre del barrio (anidado de sector)"
            {...register('barrioId')}
          />

          <Select
            label="Calle / Mz"
            options={calleOptions}
            error={errors.calleId?.message}
            disabled={loading}
            placeholder="Ingrese nombre del barrio (anidado de sector)"
            {...register('calleId')}
          />

          <div className="flex gap-6">
            <div className="flex-1">
              <Input
                label="Cuadra"
                error={errors.cuadra?.message}
                disabled={loading}
                placeholder="Ingrese cuadra"
                {...register('cuadra')}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Lado"
                options={lados}
                error={errors.lado?.message}
                disabled={loading}
                {...register('lado')}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <Input
                label="Lote inicial"
                type="number"
                error={errors.loteInicial?.message}
                disabled={loading}
                placeholder="Ingrese"
                {...register('loteInicial')}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Lote final"
                type="number"
                error={errors.loteFinal?.message}
                disabled={loading}
                placeholder="Ingrese"
                {...register('loteFinal')}
              />
            </div>
          </div>
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

export default DireccionForm;