// src/components/calles/CalleForm.tsx - CORREGIDO PARA REACT-HOOK-FORM
import React, { useEffect } from 'react';
import { z } from 'zod';
import { EntityForm } from '../EntityForm';
import { Input, Select } from '../';
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
  
  // 🔥 PREPARAR OPCIONES DE FORMA SEGURA
  const sectorOptions = React.useMemo(() => {
    const options = sectores
      .filter(sector => sector && sector.id && sector.nombre)
      .map(sector => ({
        value: sector.id!.toString(),
        label: sector.nombre!
      }));
    
    console.log('🔧 [CalleForm] Sectores preparados:', options.length, options.slice(0, 3));
    return options;
  }, [sectores]);

  const barrioOptions = React.useMemo(() => {
    const options = barriosFiltrados
      .filter(barrio => barrio && barrio.id && (barrio.nombre || barrio.nombreBarrio))
      .map(barrio => ({
        value: barrio.id!.toString(),
        label: (barrio.nombre || barrio.nombreBarrio)!
      }));
    
    // Agregar opción de auto-crear si no hay barrios
    if (barriosFiltrados.length === 0) {
      options.push({
        value: 'auto-create',
        label: '✨ Crear barrio automáticamente'
      });
    }
    
    console.log('🔧 [CalleForm] Barrios preparados:', options.length, options.slice(0, 3));
    return options;
  }, [barriosFiltrados]);

  const tipoViaOptions = React.useMemo(() => {
    const options = tiposVia.map(tipo => ({
      value: tipo.value,
      label: tipo.label
    }));
    
    console.log('🔧 [CalleForm] Tipos de vía preparados:', options.length);
    return options;
  }, [tiposVia]);

  // 🔥 CONVERTIR CALLE SELECCIONADA A FORMATO DE FORMULARIO
  const selectedItemForForm = React.useMemo(() => {
    if (!calleSeleccionada) {
      console.log('🔧 [CalleForm] No hay calle seleccionada');
      return null;
    }
    
    const formData = {
      sectorId: calleSeleccionada.sectorId?.toString() || '',
      barrioId: calleSeleccionada.barrioId?.toString() || '',
      tipoVia: calleSeleccionada.tipoVia || '',
      nombre: calleSeleccionada.nombre || ''
    };
    
    console.log('🔧 [CalleForm] Convirtiendo calle seleccionada:', {
      original: calleSeleccionada,
      converted: formData
    });
    
    return formData;
  }, [calleSeleccionada]);

  // 🔥 MANEJAR SUBMIT DEL FORMULARIO
  const handleSave = (data: CalleFormFields) => {
    console.log('💾 [CalleForm] Datos del formulario recibidos:', data);
    
    const calleData: CalleFormData = {
      sectorId: parseInt(data.sectorId),
      barrioId: data.barrioId === 'auto-create' ? 999 : parseInt(data.barrioId),
      tipoVia: data.tipoVia,
      nombre: data.nombre.trim()
    };
    
    console.log('💾 [CalleForm] Datos procesados para guardar:', calleData);
    onGuardar(calleData);
  };

  return (
    <EntityForm<CalleFormFields>
      title="Datos de la calle"
      schema={calleSchema}
      defaultValues={{
        sectorId: '',
        barrioId: '',
        tipoVia: '',
        nombre: ''
      }}
      selectedItem={selectedItemForForm}
      onSave={handleSave}
      onNew={onNuevo}
      onEdit={onEditar}
      loading={loading || loadingSectores || loadingBarrios || loadingTiposVia}
      isEditMode={isEditMode}
      isOfflineMode={isOfflineMode}
    >
      {({ register, errors, watch, setValue, formState }) => {
        // 🔥 WATCH VALUES CON LOGGING
        const watchedSectorId = watch('sectorId');
        const watchedBarrioId = watch('barrioId');
        const watchedTipoVia = watch('tipoVia');
        const watchedNombre = watch('nombre');

        // 🔥 LOG DE VALORES OBSERVADOS
        React.useEffect(() => {
          console.log('👀 [CalleForm] Valores observados:', {
            sectorId: watchedSectorId,
            barrioId: watchedBarrioId,
            tipoVia: watchedTipoVia,
            nombre: watchedNombre
          });
        }, [watchedSectorId, watchedBarrioId, watchedTipoVia, watchedNombre]);

        // 🔥 MANEJAR CAMBIO DE SECTOR
        useEffect(() => {
          if (watchedSectorId && watchedSectorId !== '') {
            const sectorId = parseInt(watchedSectorId);
            console.log('🔄 [CalleForm] Sector cambió a:', sectorId);
            onSectorChange(sectorId);
            
            // Solo resetear barrio si no estamos cargando datos iniciales y el barrio actual no pertenece al nuevo sector
            if (!calleSeleccionada || calleSeleccionada.sectorId !== sectorId) {
              console.log('🧹 [CalleForm] Reseteando barrio por cambio de sector');
              setValue('barrioId', '');
            }
          }
        }, [watchedSectorId, onSectorChange, setValue, calleSeleccionada]);

        // Estados de habilitación
        const isSectorSelected = watchedSectorId && watchedSectorId !== '';
        const isBarrioSelected = watchedBarrioId && watchedBarrioId !== '';
        const isTipoViaSelected = watchedTipoVia && watchedTipoVia !== '';

        return (
          <div className="space-y-6">
            {/* Alertas de estado */}
            {(loadingSectores || loadingBarrios || loadingTiposVia) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-700">
                  {loadingSectores && '⏳ Cargando sectores... '}
                  {loadingBarrios && '⏳ Cargando barrios... '}
                  {loadingTiposVia && '⏳ Cargando tipos de vía...'}
                </div>
              </div>
            )}

            {sectorOptions.length === 0 && !loadingSectores && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-700">
                  ❌ No hay sectores disponibles. Verifique la conexión.
                </div>
              </div>
            )}

            {/* Primera fila: Sector y Barrio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 🔥 SELECT DE SECTOR CON REGISTER CORRECTO */}
              <div>
                <Select
                  label={`Sector ${sectorOptions.length > 0 ? `(${sectorOptions.length} disponibles)` : ''}`}
                  options={sectorOptions}
                  error={errors.sectorId?.message}
                  disabled={loadingSectores || formState.isSubmitting}
                  placeholder={
                    loadingSectores 
                      ? "⏳ Cargando sectores..." 
                      : sectorOptions.length === 0
                      ? "❌ No hay sectores"
                      : "📍 Seleccione un sector"
                  }
                  {...register('sectorId')}
                />
                
                {/* 🔥 DEBUG ESPECÍFICO PARA SECTOR */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-medium text-yellow-800">🔧 DEBUG SECTOR:</div>
                    <div>Valor actual: "{watchedSectorId}"</div>
                    <div>Opciones disponibles: {sectorOptions.length}</div>
                    <div>Register name: sectorId</div>
                    <div>Es válido: {sectorOptions.some(opt => opt.value === watchedSectorId) ? '✅' : '❌'}</div>
                  </div>
                )}
              </div>
              
              {/* 🔥 SELECT DE BARRIO CON REGISTER CORRECTO */}
              <div>
                <Select
                  label={`Barrio ${barrioOptions.length > 0 ? `(${barriosFiltrados.length} del sector)` : ''}`}
                  options={barrioOptions}
                  error={errors.barrioId?.message}
                  disabled={!isSectorSelected || loadingBarrios || formState.isSubmitting}
                  placeholder={
                    !isSectorSelected 
                      ? "🔒 Primero seleccione un sector"
                      : loadingBarrios 
                      ? "⏳ Cargando barrios..." 
                      : "🏘️ Seleccione un barrio"
                  }
                  {...register('barrioId')}
                />
                
                {/* 🔥 DEBUG ESPECÍFICO PARA BARRIO */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-medium text-yellow-800">🔧 DEBUG BARRIO:</div>
                    <div>Valor actual: "{watchedBarrioId}"</div>
                    <div>Opciones disponibles: {barrioOptions.length}</div>
                    <div>Habilitado: {isSectorSelected ? '✅' : '❌'}</div>
                    <div>Barrios filtrados: {barriosFiltrados.length}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Segunda fila: Tipo de Vía y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 🔥 SELECT DE TIPO DE VÍA CON REGISTER CORRECTO */}
              <div>
                <Select
                  label={`Tipo de vía ${tipoViaOptions.length > 0 ? `(${tipoViaOptions.length} tipos)` : ''}`}
                  options={tipoViaOptions}
                  error={errors.tipoVia?.message}
                  disabled={!isBarrioSelected || loadingTiposVia || formState.isSubmitting}
                  placeholder={
                    !isBarrioSelected
                      ? "🔒 Primero seleccione un barrio"
                      : loadingTiposVia
                      ? "⏳ Cargando tipos..."
                      : "🛣️ Seleccione tipo de vía"
                  }
                  {...register('tipoVia')}
                />
              </div>
              
              {/* 🔥 INPUT DE NOMBRE CON REGISTER CORRECTO */}
              <div>
                <Input
                  label="Nombre de la vía"
                  error={errors.nombre?.message}
                  disabled={!isTipoViaSelected || formState.isSubmitting}
                  placeholder={
                    !isTipoViaSelected
                      ? "🔒 Primero seleccione tipo de vía"
                      : "✏️ Ingrese nombre de la vía"
                  }
                  {...register('nombre')}
                />
              </div>
            </div>

            {/* Alerta para barrio auto-creado */}
            {watchedBarrioId === 'auto-create' && isSectorSelected && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="text-sm font-medium text-amber-900 mb-2">🆕 Creación automática de barrio</h4>
                <div className="text-sm text-amber-700">
                  <p>Se creará automáticamente un barrio para este sector:</p>
                  <p className="font-medium mt-1">
                    "Barrio Principal - {sectores.find(s => s.id?.toString() === watchedSectorId)?.nombre || 'Sector'}"
                  </p>
                </div>
              </div>
            )}

            {/* Preview de la dirección completa */}
            {isSectorSelected && isBarrioSelected && isTipoViaSelected && watchedNombre && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">🎯 Vista previa de la calle:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    <span className="font-medium">📍 Ubicación:</span> {' '}
                    {sectores.find(s => s.id?.toString() === watchedSectorId)?.nombre || 'N/A'} - {' '}
                    {watchedBarrioId === 'auto-create' 
                      ? `Barrio Principal - ${sectores.find(s => s.id?.toString() === watchedSectorId)?.nombre || 'Sector'}`
                      : barriosFiltrados.find(b => b.id?.toString() === watchedBarrioId)?.nombre || 
                        barriosFiltrados.find(b => b.id?.toString() === watchedBarrioId)?.nombreBarrio || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">🛣️ Calle completa:</span> {' '}
                    {tiposVia.find(t => t.value === watchedTipoVia)?.descripcion || 
                     tiposVia.find(t => t.value === watchedTipoVia)?.label || watchedTipoVia} {watchedNombre}
                  </div>
                </div>
              </div>
            )}

            {/* Progreso del formulario */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">📋 Progreso del formulario:</h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`flex items-center justify-center p-2 rounded ${isSectorSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isSectorSelected ? '✅' : '1️⃣'} Sector
                </div>
                <div className={`flex items-center justify-center p-2 rounded ${isBarrioSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isBarrioSelected ? '✅' : '2️⃣'} Barrio
                </div>
                <div className={`flex items-center justify-center p-2 rounded ${isTipoViaSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isTipoViaSelected ? '✅' : '3️⃣'} Tipo
                </div>
                <div className={`flex items-center justify-center p-2 rounded ${watchedNombre ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {watchedNombre ? '✅' : '4️⃣'} Nombre
                </div>
              </div>
            </div>

            {/* 🔥 DEBUG COMPLETO EN DESARROLLO */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-gray-800 text-green-400 text-xs rounded font-mono">
                <details>
                  <summary className="text-green-300 font-bold cursor-pointer">🔧 DEBUG COMPLETO CALLEFORM</summary>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>📊 Sectores cargados: {sectores.length}</div>
                      <div>📊 Opciones sector: {sectorOptions.length}</div>
                      <div>📊 Barrios filtrados: {barriosFiltrados.length}</div>
                      <div>📊 Opciones barrio: {barrioOptions.length}</div>
                      <div>📊 Tipos vía: {tipoViaOptions.length}</div>
                      <div>📊 Form válido: {formState.isValid.toString()}</div>
                    </div>
                    
                    <div className="border-t border-gray-600 pt-2">
                      <div className="text-yellow-400 font-bold">📝 Valores del formulario:</div>
                      <div>sectorId: "{watchedSectorId}"</div>
                      <div>barrioId: "{watchedBarrioId}"</div>
                      <div>tipoVia: "{watchedTipoVia}"</div>
                      <div>nombre: "{watchedNombre}"</div>
                    </div>
                    
                    {Object.keys(errors).length > 0 && (
                      <div className="border-t border-gray-600 pt-2">
                        <div className="text-red-400 font-bold">❌ Errores:</div>
                        {Object.entries(errors).map(([key, error]) => (
                          <div key={key}>{key}: {error?.message}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        );
      }}
    </EntityForm>
  );
};

export default CalleForm;