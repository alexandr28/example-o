// src/components/calles/CalleForm.tsx - VERSIÓN CON NAVEGACIÓN SEGURA
import React, { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormWrapper } from '../../hooks/useFormWrapper';
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
  
  // Crear el formulario base
  const baseForm = useForm<CalleFormFields>({
    resolver: zodResolver(calleSchema),
    defaultValues: {
      sectorId: '',
      barrioId: '',
      tipoVia: '',
      nombre: ''
    },
    mode: 'onChange'
  });

  // Usar el wrapper para integrar con FormContext
  const form = useFormWrapper({
    formId: 'calle-form',
    form: baseForm
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
    markSaved
  } = form;

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
      const formData = {
        sectorId: calleSeleccionada.sectorId?.toString() || '',
        barrioId: calleSeleccionada.barrioId?.toString() || '',
        tipoVia: calleSeleccionada.tipoVia || '',
        nombre: calleSeleccionada.nombre || ''
      };
      
      reset(formData);
    }
  }, [calleSeleccionada, reset]);

  // Limpiar barrio cuando cambia el sector
  useEffect(() => {
    if (sectorId && parseInt(sectorId) > 0) {
      // Solo limpiar el barrio si no hay una calle seleccionada
      if (!calleSeleccionada) {
        setValue('barrioId', '');
      }
      onSectorChange(parseInt(sectorId));
    }
  }, [sectorId, setValue, onSectorChange, calleSeleccionada]);

  // Manejar el envío del formulario
  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const formData: CalleFormData = {
        sectorId: parseInt(data.sectorId),
        barrioId: parseInt(data.barrioId),
        tipoVia: data.tipoVia,
        nombre: data.nombre.trim()
      };
      
      await onGuardar(formData);
      
      // Marcar el formulario como guardado exitosamente
      markSaved();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      // El error se maneja en el componente padre
    }
  });

  // Manejar nuevo registro
  const handleNuevo = () => {
    reset({
      sectorId: '',
      barrioId: '',
      tipoVia: '',
      nombre: ''
    });
    onNuevo();
  };

  // Manejar edición
  const handleEditar = () => {
    onEditar();
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditMode ? 'Editar Calle' : 'Nueva Calle'}
        </h2>
        {isOfflineMode && (
          <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Modo sin conexión - Los cambios se guardarán localmente
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
              disabled={loadingSectores || (isEditMode && !!calleSeleccionada)}
              placeholder={loadingSectores ? "Cargando sectores..." : "Seleccione un sector"}
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
      <div className="mt-6 bg-gray-50 p-4 rounded-md">
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
        <details className="mt-4 bg-gray-800 text-white p-3 rounded text-xs">
          <summary className="cursor-pointer font-bold">🐛 Debug Info</summary>
          <div className="mt-2 space-y-1">
            <div>Sector ID: {sectorId || '(vacío)'}</div>
            <div>Barrio ID: {barrioId || '(vacío)'}</div>
            <div>Tipo Vía: {tipoVia || '(vacío)'}</div>
            <div>Nombre: {nombre || '(vacío)'}</div>
            <div>Form Valid: {isValid ? '✅' : '❌'}</div>
            <div>Form Dirty: {isDirty ? '✅' : '❌'}</div>
            <div>Modo: {isEditMode ? 'Edición' : 'Nuevo'}</div>
            {errors.sectorId && <div>Error Sector: {errors.sectorId.message}</div>}
            {errors.barrioId && <div>Error Barrio: {errors.barrioId.message}</div>}
            {errors.tipoVia && <div>Error Tipo: {errors.tipoVia.message}</div>}
            {errors.nombre && <div>Error Nombre: {errors.nombre.message}</div>}
          </div>
        </details>
      )}

      {/* Botones de acción */}
      <div className="mt-6 flex gap-3 justify-end">
        {!isEditMode && calleSeleccionada && (
          <Button
            type="button"
            onClick={handleEditar}
            variant="secondary"
            disabled={loading}
          >
            Editar
          </Button>
        )}
        
        <Button
          type="button"
          onClick={handleNuevo}
          variant="secondary"
          disabled={loading}
        >
          Nuevo
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !isValid || !isDirty}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};

export default CalleForm;