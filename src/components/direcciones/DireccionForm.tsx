// src/components/direcciones/DireccionForm.tsx - VERSIÓN SIN RESTRICCIONES
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Direccion, Sector, Barrio, Calle, LadoDireccion } from '../../models';

// Schema de validación simplificado
const direccionSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  barrioId: z.string().min(1, 'Debe seleccionar un barrio'),
  calleId: z.string().min(1, 'Debe seleccionar una calle'),
  cuadra: z.string().min(1, 'La cuadra es requerida'),
  lado: z.nativeEnum(LadoDireccion),
  loteInicial: z.string().refine(val => parseInt(val) >= 0, 'Debe ser mayor o igual a 0'),
  loteFinal: z.string().refine(val => parseInt(val) >= 0, 'Debe ser mayor o igual a 0'),
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
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
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

  // Estados locales
  const [isEditMode, setIsEditMode] = useState(false);
  const [barriosFiltrados, setBarriosFiltrados] = useState<Barrio[]>([]);
  const [callesFiltradas, setCallesFiltradas] = useState<Calle[]>([]);

  // Observar cambios
  const watchedSectorId = watch('sectorId');
  const watchedBarrioId = watch('barrioId');

  // NO FILTRAR - Mostrar todos los barrios disponibles
  useEffect(() => {
    setBarriosFiltrados(barrios);
  }, [barrios]);

  // NO FILTRAR - Mostrar todas las calles disponibles
  useEffect(() => {
    setCallesFiltradas(calles);
  }, [calles]);

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
    if (!isEditMode) {
      reset();
    }
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
                  <option value="">Ingrese nombre del sector</option>
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
            <p className="text-xs text-gray-500 mt-1">
              Valor: "{watchedSectorId}" | Válido: {watchedSectorId ? '✅' : '❌'}
            </p>
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
                  disabled={isFormDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Ingrese nombre del barrio (anidado de sector)</option>
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
            <p className="text-xs text-gray-500 mt-1">
              Valor: "{watchedBarrioId}" | Válido: {watchedBarrioId ? '✅' : '❌'}
            </p>
          </div>

          {/* Calle */}
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
                  disabled={isFormDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Ingrese nombre del barrio (anidado de sector)</option>
                  {callesFiltradas.map(calle => (
                    <option key={calle.id} value={calle.id.toString()}>
                      {calle.tipoVia === 'avenida' ? 'Av. ' : ''}{calle.nombre}
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
              Cuadra
            </label>
            <Controller
              name="cuadra"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  disabled={isFormDisabled}
                  placeholder="12"
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
                  <option value="">Seleccione</option>
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
            <p className="text-xs text-gray-500 mt-1">
              Valor: "{watch('lado')}" | Válido: {watch('lado') ? '✅' : '❌'}
            </p>
          </div>

          {/* Lote inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lote inicial
            </label>
            <Controller
              name="loteInicial"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  disabled={isFormDisabled}
                  placeholder="10"
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
              Lote final
            </label>
            <Controller
              name="loteFinal"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  disabled={isFormDisabled}
                  placeholder="20"
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

      {/* Panel de Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
          <h3 className="font-bold mb-2">🐛 Debug Info:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Formulario:</strong>
              <ul>
                <li>isEditMode: {isEditMode ? 'SÍ' : 'NO'}</li>
                <li>isFormDisabled: {isFormDisabled ? 'SÍ' : 'NO'}</li>
                <li>direccionSeleccionada: {direccionSeleccionada ? `ID ${direccionSeleccionada.id}` : 'null'}</li>
              </ul>
            </div>
            <div>
              <strong>Datos disponibles:</strong>
              <ul>
                <li>Sectores: {sectores.length}</li>
                <li>Barrios (todos): {barrios.length}</li>
                <li>Barrios (filtrados): {barriosFiltrados.length}</li>
                <li>Calles (todas): {calles.length}</li>
                <li>Calles (filtradas): {callesFiltradas.length}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DireccionForm;