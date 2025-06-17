// src/components/calles/CalleForm.tsx - VERSIÓN CON CONTROLLER
import React, { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Button } from '../';
import { Calle, CalleFormData, TipoViaOption, isValidTipoVia } from '../../models/Calle';
import { Sector, Barrio } from '../../models/';

// Schema de validación
const calleSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  barrioId: z.string().min(1, 'Debe seleccionar un barrio'),
  tipoVia: z.string()
    .min(1, 'Debe seleccionar un tipo de vía')
    .refine(isValidTipoVia, 'Tipo de vía no válido'),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .refine(val => val.trim().length >= 2, 'El nombre no puede estar vacío')
});

type CalleFormFields = z.infer<typeof calleSchema>;

interface CalleFormProps {
  calleSeleccionada?: Calle | null;
  sectores: Sector[];
  barrios: Barrio[];
  barriosFiltrados: Barrio[];
  tiposVia: TipoViaOption[];
  onGuardar: (data: CalleFormData) => void;
  onNuevo: () => void;
  onEditar: () => void;
  onSectorChange: (sectorId: number) => void;
  loading?: boolean;
  loadingSectores?: boolean;
  loadingBarrios?: boolean;
  loadingTiposVia?: boolean;
  isEditMode?: boolean;
  isOfflineMode?: boolean;
}

const CalleForm: React.FC<CalleFormProps> = ({
  calleSeleccionada,
  sectores,
  barrios,
  barriosFiltrados,
  tiposVia,
  onGuardar,
  onNuevo,
  onEditar,
  onSectorChange,
  loading = false,
  loadingSectores = false,
  loadingBarrios = false,
  loadingTiposVia = false,
  isEditMode = false,
  isOfflineMode = false,
}) => {
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue
  } = useForm<CalleFormFields>({
    resolver: zodResolver(calleSchema),
    defaultValues: {
      sectorId: '',
      barrioId: '',
      tipoVia: '',
      nombre: ''
    },
    mode: 'onChange'
  });

  // Preparar opciones para los selects
  const sectorOptions = React.useMemo(() => {
    return sectores
      .filter(sector => sector?.id && sector?.nombre)
      .map(sector => ({
        value: sector.id.toString(),
        label: sector.nombre
      }));
  }, [sectores]);

  const barrioOptions = React.useMemo(() => {
    return barriosFiltrados
      .filter(barrio => barrio?.id && (barrio?.nombre || barrio?.nombreBarrio))
      .map(barrio => ({
        value: barrio.id.toString(),
        label: barrio.nombre || barrio.nombreBarrio || ''
      }));
  }, [barriosFiltrados]);

  const tipoViaOptions = React.useMemo(() => {
    return tiposVia.map(tipo => ({
      value: tipo.value,
      label: tipo.label
    }));
  }, [tiposVia]);

  // Observar valores del formulario
  const sectorId = watch('sectorId');
  const barrioId = watch('barrioId');
  const tipoVia = watch('tipoVia');
  const nombre = watch('nombre');

  // Cargar datos cuando se selecciona una calle
  useEffect(() => {
    if (calleSeleccionada) {
      reset({
        sectorId: calleSeleccionada.sectorId?.toString() || '',
        barrioId: calleSeleccionada.barrioId?.toString() || '',
        tipoVia: calleSeleccionada.tipoVia || '',
        nombre: calleSeleccionada.nombre || ''
      });
    }
  }, [calleSeleccionada, reset]);

  // Manejar cambio de sector
  useEffect(() => {
    if (sectorId) {
      const sectorIdNum = parseInt(sectorId);
      console.log('🔄 Sector cambió:', sectorIdNum);
      onSectorChange(sectorIdNum);
      
      // Verificar si el barrio actual pertenece al nuevo sector
      if (barrioId) {
        const barrioValido = barriosFiltrados.some(b => b.id.toString() === barrioId);
        if (!barrioValido) {
          setValue('barrioId', '');
        }
      }
    }
  }, [sectorId, barrioId, barriosFiltrados, onSectorChange, setValue]);

  // Manejar el guardado
  const onSubmit = (data: CalleFormFields) => {
    const calleData: CalleFormData = {
      sectorId: parseInt(data.sectorId),
      barrioId: parseInt(data.barrioId),
      tipoVia: data.tipoVia,
      nombre: data.nombre.trim()
    };
    
    console.log('💾 Guardando calle:', calleData);
    onGuardar(calleData);
    
    if (!isEditMode) {
      reset();
    }
  };

  const handleNuevo = () => {
    reset({
      sectorId: '',
      barrioId: '',
      tipoVia: '',
      nombre: ''
    });
    onNuevo();
  };

  const isFormDisabled = loading || (calleSeleccionada && !isEditMode);

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-medium text-gray-800">Datos de la calle</h2>
          {calleSeleccionada && !isEditMode && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
              Modo vista
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isOfflineMode && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Modo sin conexión
            </span>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <fieldset disabled={isFormDisabled} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector con Controller */}
            <Controller
              name="sectorId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Sector"
                  options={sectorOptions}
                  error={errors.sectorId?.message}
                  disabled={loadingSectores}
                  placeholder="Seleccione un sector"
                />
              )}
            />

            {/* Barrio con Controller */}
            <Controller
              name="barrioId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Barrio"
                  options={barrioOptions}
                  error={errors.barrioId?.message}
                  disabled={!sectorId || loadingBarrios}
                  placeholder={!sectorId ? "Primero seleccione un sector" : "Seleccione un barrio"}
                />
              )}
            />

            {/* Tipo de vía con Controller */}
            <Controller
              name="tipoVia"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Tipo de vía"
                  options={tipoViaOptions}
                  error={errors.tipoVia?.message}
                  disabled={loadingTiposVia}
                  placeholder="Seleccione tipo de vía"
                />
              )}
            />

            {/* Nombre - este puede usar register directamente */}
            <div>
              <Input
                label="Nombre de la vía"
                error={errors.nombre?.message}
                placeholder="Ingrese el nombre de la vía"
                {...register('nombre')}
              />
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-700 mb-2">Progreso del formulario:</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className={`p-2 rounded text-center ${sectorId ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {sectorId ? '✅' : '⭕'} Sector
              </div>
              <div className={`p-2 rounded text-center ${barrioId ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {barrioId ? '✅' : '⭕'} Barrio
              </div>
              <div className={`p-2 rounded text-center ${tipoVia ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {tipoVia ? '✅' : '⭕'} Tipo
              </div>
              <div className={`p-2 rounded text-center ${nombre && nombre.trim().length >= 2 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {nombre && nombre.trim().length >= 2 ? '✅' : '⭕'} Nombre
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-800 text-white p-3 rounded text-xs">
              <summary className="cursor-pointer font-bold">🐛 Debug Info</summary>
              <div className="mt-2 space-y-1">
                <div>Sector ID: {sectorId || '(vacío)'}</div>
                <div>Barrio ID: {barrioId || '(vacío)'}</div>
                <div>Tipo Vía: {tipoVia || '(vacío)'}</div>
                <div>Nombre: {nombre || '(vacío)'}</div>
                <div>Form Valid: {isValid ? '✅' : '❌'}</div>
                <div>Form Dirty: {isDirty ? 'Sí' : 'No'}</div>
                <div>Sectores disponibles: {sectorOptions.length}</div>
                <div>Barrios filtrados: {barrioOptions.length}</div>
              </div>
            </details>
          )}
        </fieldset>
        
        <div className="flex justify-center space-x-4 mt-6">
          {!calleSeleccionada || isEditMode ? (
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || loading}
            >
              Guardar
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={onEditar}
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
            Nuevo
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CalleForm;