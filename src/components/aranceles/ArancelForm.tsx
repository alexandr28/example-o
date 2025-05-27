import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Select, Button,SelectorDirecciones } from '../';
import { Arancel, LadoDireccion } from '../../models';
import { Direccion as ModelDireccion } from '../../models/';
import { Direccion as TypeDireccion } from '../../types/formTypes';


// Schema simplificado para evitar problemas de tipado
const arancelSchema = z.object({
  año: z.string().min(1, 'El año es requerido'),
  direccionId: z.string().min(1, 'Debe seleccionar una dirección'),
  lado: z.string().min(1, 'El lado es requerido'),
  loteInicial: z.string().refine(val => !isNaN(Number(val)), {
    message: 'Debe ser un número'
  }),
  loteFinal: z.string().refine(val => !isNaN(Number(val)), {
    message: 'Debe ser un número'
  }),
  monto: z.string().refine(val => !isNaN(Number(val)), {
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

type FormValues = z.infer<typeof arancelSchema>;

interface ArancelFormProps {
  arancelSeleccionado?: Arancel | null;
  direcciones: ModelDireccion[];
  direccionSeleccionada: ModelDireccion | null;
  años: { value: string, label: string }[];
  onGuardar: (data: any) => void;
  onSelectDireccion: (direccion: ModelDireccion) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
}

const ArancelForm: React.FC<ArancelFormProps> = ({
  arancelSeleccionado,
  direcciones,
  direccionSeleccionada,
  años,
  onGuardar,
  onSelectDireccion,
  onNuevo,
  onEditar,
  loading = false,
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm<FormValues>({
    resolver: zodResolver(arancelSchema),
    defaultValues: {
      año: '',
      direccionId: '',
      lado: '',
      loteInicial: '0',
      loteFinal: '0',
      monto: '0.00',
    }
  });

  // Estado local para mostrar la información de la dirección seleccionada
  const [descripcionDireccion, setDescripcionDireccion] = useState<string>('');
  
  // Estado para controlar la visibilidad del modal
  const [isDireccionModalOpen, setIsDireccionModalOpen] = useState(false);
  
  // Convertir las direcciones del modelo al formato necesario para el selector
  const direccionesParaSelector: TypeDireccion[] = direcciones.map(d => ({
    id: d.id,
    descripcion: d.descripcion || `Dirección ${d.id}`,
    lado: d.lado as string,
    loteInicial: d.loteInicial,
    loteFinal: d.loteFinal
  }));
  
  // Actualizar el formulario cuando se selecciona un arancel para editar
  useEffect(() => {
    if (arancelSeleccionado) {
      setValue('año', arancelSeleccionado.año.toString());
      setValue('direccionId', arancelSeleccionado.direccionId.toString());
      setValue('lado', arancelSeleccionado.lado);
      setValue('loteInicial', arancelSeleccionado.loteInicial.toString());
      setValue('loteFinal', arancelSeleccionado.loteFinal.toString());
      setValue('monto', arancelSeleccionado.monto.toString());
      
      // Actualizar descripción de la dirección
      const direccion = direcciones.find(d => d.id === arancelSeleccionado.direccionId);
      if (direccion) {
        setDescripcionDireccion(direccion.descripcion || '');
      }
    }
  }, [arancelSeleccionado, setValue, direcciones]);

  const onSubmit = (data: FormValues) => {
    // Convertimos manualmente a los tipos correctos
    const formattedData = {
      año: parseInt(data.año),
      direccionId: parseInt(data.direccionId),
      lado: data.lado,
      loteInicial: parseInt(data.loteInicial),
      loteFinal: parseInt(data.loteFinal),
      monto: parseFloat(data.monto),
    };
    
    onGuardar(formattedData);
    reset();
    setDescripcionDireccion('');
  };

  const handleNuevo = () => {
    reset();
    setDescripcionDireccion('');
    onNuevo();
  };

  // Manejadores para el modal de dirección
  const handleOpenDireccionModal = () => {
    setIsDireccionModalOpen(true);
  };

  const handleCloseDireccionModal = () => {
    setIsDireccionModalOpen(false);
  };

  // Manejador para seleccionar una dirección desde el modal
  const handleSelectDireccion = (direccion: TypeDireccion) => {
    setValue('direccionId', direccion.id.toString());
    setDescripcionDireccion(direccion.descripcion || `Dirección ${direccion.id}`);
    
    // Buscar la dirección completa en el modelo
    const modelDireccion = direcciones.find(d => d.id === direccion.id);
    if (modelDireccion) {
      onSelectDireccion(modelDireccion);
    }
    
    handleCloseDireccionModal();
  };

  // Opciones para el selector de lado utilizando el enum
  const ladoOptions = [
    { value: LadoDireccion.IZQUIERDO, label: 'Izquierdo' },
    { value: LadoDireccion.DERECHO, label: 'Derecho' },
    { value: LadoDireccion.PAR, label: 'Par' },
    { value: LadoDireccion.IMPAR, label: 'Impar' },
    { value: LadoDireccion.NINGUNO, label: 'Ninguno' },
  ];

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Asignación de aranceles</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Año */}
          <div className="w-1/4">
            <Select
              label="Año"
              options={años}
              error={errors.año?.message}
              disabled={loading}
              {...register('año')}
            />
          </div>
          
          {/* Dirección */}
          <div className="border p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-4">
                <div className="mb-1 text-sm font-medium text-gray-700">Vía</div>
                <div className="flex">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 px-3 py-2 rounded-l-md hover:bg-gray-400"
                    onClick={handleOpenDireccionModal}
                  >
                    Seleccionar dirección
                  </button>
                  <Input
                    value={descripcionDireccion}
                    disabled={true}
                    className="rounded-l-none bg-gray-100"
                    placeholder="Seleccione una dirección"
                  />
                  <input 
                    type="hidden" 
                    {...register('direccionId')}
                  />
                </div>
                {errors.direccionId && (
                  <p className="mt-1 text-sm text-red-600">{errors.direccionId.message}</p>
                )}
              </div>
              
             
            </div>
          </div>
          
          {/* Monto */}
          <div className="w-1/4">
            <Input
              label="Monto"
              type="number"
              step="0.01"
              placeholder="Ingresar monto"
              error={errors.monto?.message}
              disabled={loading}
              {...register('monto')}
            />
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
            disabled={loading || !arancelSeleccionado}
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

      {/* Modal para selección de dirección */}
      <SelectorDirecciones
        isOpen={isDireccionModalOpen}
        onClose={handleCloseDireccionModal}
        onSelectDireccion={handleSelectDireccion}
        direcciones={direccionesParaSelector}
      />
    </div>
  );
};

export default ArancelForm;