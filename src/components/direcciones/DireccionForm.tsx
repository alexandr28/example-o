// src/components/direcciones/DireccionForm.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import { Direccion, Sector, Barrio, Calle, LadoDireccion } from '../../models';
import { DireccionFormData } from '../../models/Direccion';

// Schema de validación
const direccionSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  barrioId: z.string().min(1, 'Debe seleccionar un barrio'),
  calleId: z.string().min(1, 'Debe seleccionar una calle'),
  cuadra: z.string().min(1, 'La cuadra es requerida'),
  lado: z.nativeEnum(LadoDireccion),
  loteInicial: z.string()
    .min(1, 'El lote inicial es requerido')
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Debe ser un número mayor o igual a 0'),
  loteFinal: z.string()
    .min(1, 'El lote final es requerido')
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Debe ser un número mayor o igual a 0'),
}).refine(data => {
  const loteInicial = parseInt(data.loteInicial);
  const loteFinal = parseInt(data.loteFinal);
  return loteFinal >= loteInicial;
}, {
  message: "El lote final debe ser mayor o igual al lote inicial",
  path: ["loteFinal"],
});

type FormValues = z.infer<typeof direccionSchema>;

interface DireccionFormProps {
  direccionSeleccionada: Direccion | null;
  sectores: Sector[];
  barrios: Barrio[];
  calles: Calle[];
  lados: { value: string, label: string }[];
  sectorSeleccionado: number | null;
  onSectorChange: (sectorId: number) => void;
  onGuardar: (data: DireccionFormData) => void;
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
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(direccionSchema),
    defaultValues: {
      sectorId: '',
      barrioId: '',
      calleId: '',
      cuadra: '',
      lado: LadoDireccion.NINGUNO,
      loteInicial: '1',
      loteFinal: '1',
    }
  });

  // Estados locales
  const [isEditMode, setIsEditMode] = useState(true);
  const [barriosFiltrados, setBarriosFiltrados] = useState<Barrio[]>([]);
  const [callesFiltradas, setCallesFiltradas] = useState<Calle[]>([]);

  // Observar cambios
  const watchedSectorId = watch('sectorId');
  const watchedBarrioId = watch('barrioId');

  // Filtrar barrios según el sector seleccionado
  useEffect(() => {
    if (watchedSectorId) {
      const filtered = barrios.filter(b => b.sectorId === parseInt(watchedSectorId));
      setBarriosFiltrados(filtered);
      
      // Si el barrio actual no pertenece al sector, limpiar selección
      const currentBarrioId = watch('barrioId');
      if (currentBarrioId && !filtered.find(b => b.id.toString() === currentBarrioId)) {
        setValue('barrioId', '');
      }
    } else {
      setBarriosFiltrados([]);
      setValue('barrioId', '');
    }
  }, [watchedSectorId, barrios, setValue, watch]);

  // Filtrar calles según el barrio seleccionado
  useEffect(() => {
    if (watchedBarrioId) {
      const filtered = calles.filter(c => c.barrioId === parseInt(watchedBarrioId));
      setCallesFiltradas(filtered);
      
      // Si la calle actual no pertenece al barrio, limpiar selección
      const currentCalleId = watch('calleId');
      if (currentCalleId && !filtered.find(c => c.id.toString() === currentCalleId)) {
        setValue('calleId', '');
      }
    } else {
      setCallesFiltradas([]);
      setValue('calleId', '');
    }
  }, [watchedBarrioId, calles, setValue, watch]);

  // Notificar cambio de sector al padre
  useEffect(() => {
    if (watchedSectorId) {
      onSectorChange(parseInt(watchedSectorId));
    }
  }, [watchedSectorId, onSectorChange]);

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
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  }, [direccionSeleccionada, setValue]);

  const onSubmit = (data: FormValues) => {
    const formattedData: DireccionFormData = {
      sectorId: parseInt(data.sectorId),
      barrioId: parseInt(data.barrioId),
      calleId: parseInt(data.calleId),
      cuadra: data.cuadra,
      lado: data.lado,
      loteInicial: parseInt(data.loteInicial),
      loteFinal: parseInt(data.loteFinal),
    };
    
    onGuardar(formattedData);
  };

  const handleNuevo = () => {
    reset();
    onNuevo();
    setIsEditMode(true);
  };

  const handleEditar = () => {
    setIsEditMode(true);
    onEditar();
  };

  // Determinar si el formulario debe estar deshabilitado
  const isFormDisabled = loading || (direccionSeleccionada !== null && !isEditMode);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Datos de la dirección</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector <span className="text-red-500">*</span>
            </label>
            <Controller
              name="sectorId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isFormDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccione un sector</option>
                  {sectores.map(sector => (
                    <option key={sector.id} value={sector.id.toString()}>
                      {sector.nombre}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.sectorId && (
              <p className="mt-1 text-sm text-red-600">{errors.sectorId.message}</p>
            )}
          </div>

          {/* Barrio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barrio <span className="text-red-500">*</span>
            </label>
            <Controller
              name="barrioId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isFormDisabled || !watchedSectorId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccione un barrio</option>
                  {barriosFiltrados.map(barrio => (
                    <option key={barrio.id} value={barrio.id.toString()}>
                      {barrio.nombre}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.barrioId && (
              <p className="mt-1 text-sm text-red-600">{errors.barrioId.message}</p>
            )}
          </div>

          {/* Calle / Mz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calle / Mz <span className="text-red-500">*</span>
            </label>
            <Controller
              name="calleId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isFormDisabled || !watchedBarrioId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccione una calle</option>
                  {callesFiltradas.map(calle => (
                    <option key={calle.id} value={calle.id.toString()}>
                      {calle.tipoVia} {calle.nombre}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.calleId && (
              <p className="mt-1 text-sm text-red-600">{errors.calleId.message}</p>
            )}
          </div>

          {/* Cuadra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuadra <span className="text-red-500">*</span>
            </label>
            <Controller
              name="cuadra"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  disabled={isFormDisabled}
                  placeholder="Ej: 20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              )}
            />
            {errors.cuadra && (
              <p className="mt-1 text-sm text-red-600">{errors.cuadra.message}</p>
            )}
          </div>

          {/* Lado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lado <span className="text-red-500">*</span>
            </label>
            <Controller
              name="lado"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isFormDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {lados.map(lado => (
                    <option key={lado.value} value={lado.value}>
                      {lado.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.lado && (
              <p className="mt-1 text-sm text-red-600">{errors.lado.message}</p>
            )}
          </div>

          {/* Lote inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lote inicial <span className="text-red-500">*</span>
            </label>
            <Controller
              name="loteInicial"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="0"
                  disabled={isFormDisabled}
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              )}
            />
            {errors.loteInicial && (
              <p className="mt-1 text-sm text-red-600">{errors.loteInicial.message}</p>
            )}
          </div>

          {/* Lote final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lote final <span className="text-red-500">*</span>
            </label>
            <Controller
              name="loteFinal"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="0"
                  disabled={isFormDisabled}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              )}
            />
            {errors.loteFinal && (
              <p className="mt-1 text-sm text-red-600">{errors.loteFinal.message}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={isFormDisabled}
          >
            Guardar
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleEditar}
            disabled={!direccionSeleccionada || isEditMode || loading}
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