// src/components/calles/CalleForm.tsx - CORREGIDO PARA SELECT DE SECTORES
import React, { useEffect } from 'react';
import { z } from 'zod';
import { EntityForm } from '../EntityForm';
import { Input, Select } from '../';
import { Calle, Sector, Barrio, TipoViaOption, isValidTipoVia } from '../../models/';

// Schema de validación actualizado
const calleSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  barrioId: z.string().min(1, 'Debe seleccionar un barrio'),
  tipoVia: z.string()
    .min(1, 'Debe seleccionar un tipo de vía')
    .refine(isValidTipoVia, 'Tipo de vía no válido'),
  nombre: z.string()
    .min(2, 'El nombre de la calle debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .refine(val => val.trim().length >= 2, 'El nombre no puede estar vacío o contener solo espacios')
});

type CalleFormDataValidated = z.infer<typeof calleSchema>;

interface CalleFormProps {
  calleSeleccionada?: Calle | null;
  sectores: Sector[];
  barrios: Barrio[];
  barriosFiltrados: Barrio[];
  tiposVia: TipoViaOption[];
  onGuardar: (data: { sectorId: number; barrioId: number; tipoVia: string; nombre: string }) => void;
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
  // 🔥 PREPARAR OPCIONES CON VALIDACIÓN
  const sectorOptions = sectores
    .filter(sector => sector.id && sector.nombre) // Filtrar sectores válidos
    .map(sector => ({
      value: sector.id!.toString(),
      label: sector.nombre!
    }));

  // Opciones de barrio con manejo inteligente
  const barrioOptions = (() => {
    if (barriosFiltrados.length === 0) {
      return [
        { 
          value: 'auto-create', 
          label: '✨ Crear barrio automáticamente' 
        }
      ];
    }
    
    const options = barriosFiltrados
      .filter(barrio => barrio.id && (barrio.nombre || barrio.nombreBarrio))
      .map(barrio => ({
        value: barrio.id!.toString(),
        label: (barrio.nombre || barrio.nombreBarrio)!
      }));
    
    options.push({
      value: 'auto-create',
      label: '✨ Crear nuevo barrio para este sector'
    });
    
    return options;
  })();

  const tipoViaOptions = tiposVia.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  // Manejar el submit del formulario
  const handleSave = (data: CalleFormDataValidated) => {
    let barrioIdFinal: number;
    
    if (data.barrioId === 'auto-create') {
      barrioIdFinal = 999; // ID especial para auto-crear
      console.log('🆕 [CalleForm] Creando barrio automáticamente para sector:', data.sectorId);
    } else {
      barrioIdFinal = parseInt(data.barrioId);
    }
    
    onGuardar({
      sectorId: parseInt(data.sectorId),
      barrioId: barrioIdFinal,
      tipoVia: data.tipoVia,
      nombre: data.nombre
    });
  };

  return (
    <EntityForm<CalleFormDataValidated>
      title="Datos de la calle"
      schema={calleSchema}
      defaultValues={{
        sectorId: '',
        barrioId: '',
        tipoVia: '',
        nombre: ''
      }}
      selectedItem={calleSeleccionada ? {
        sectorId: calleSeleccionada.sectorId?.toString() || '',
        barrioId: calleSeleccionada.barrioId?.toString() || '',
        tipoVia: calleSeleccionada.tipoVia || '',
        nombre: calleSeleccionada.nombre || ''
      } : null}
      onSave={handleSave}
      onNew={onNuevo}
      onEdit={onEditar}
      loading={loading || loadingSectores || loadingBarrios || loadingTiposVia}
      isEditMode={isEditMode}
      isOfflineMode={isOfflineMode}
    >
      {({ register, errors, watch, setValue, formState }) => {
        // Observar cambios en los campos
        const watchedSectorId = watch('sectorId');
        const watchedBarrioId = watch('barrioId');
        const watchedTipoVia = watch('tipoVia');
        const watchedNombre = watch('nombre');

        // 🔥 LOGGING DETALLADO PARA DEBUG
        useEffect(() => {
          console.log('🔍 [CalleForm] Estado actual:', {
            watchedSectorId,
            watchedBarrioId,
            watchedTipoVia,
            watchedNombre,
            sectorOptions: sectorOptions.length,
            barrioOptions: barrioOptions.length,
            loadingSectores,
            loadingBarrios
          });
        }, [watchedSectorId, watchedBarrioId, watchedTipoVia, watchedNombre, sectorOptions.length, barrioOptions.length, loadingSectores, loadingBarrios]);

        // Efecto para manejar cambio de sector
        useEffect(() => {
          if (watchedSectorId && watchedSectorId !== '') {
            const sectorIdNum = parseInt(watchedSectorId);
            console.log('🔍 [CalleForm] Sector cambió a:', sectorIdNum);
            
            onSectorChange(sectorIdNum);
            
            // Resetear campos dependientes
            if (watchedBarrioId && watchedBarrioId !== 'auto-create') {
              console.log('🧹 [CalleForm] Reseteando barrio porque cambió el sector');
              setValue('barrioId', '');
            }
            if (watchedTipoVia) {
              console.log('🧹 [CalleForm] Reseteando tipo de vía porque cambió el sector');
              setValue('tipoVia', '');
            }
            if (watchedNombre) {
              console.log('🧹 [CalleForm] Reseteando nombre porque cambió el sector');
              setValue('nombre', '');
            }
          } else {
            onSectorChange(0);
          }
        }, [watchedSectorId, onSectorChange, setValue, watchedBarrioId, watchedTipoVia, watchedNombre]);

        // Auto-seleccionar barrio si no hay opciones
        useEffect(() => {
          if (watchedSectorId && !watchedBarrioId && barriosFiltrados.length === 0) {
            console.log('🤖 [CalleForm] Auto-seleccionando barrio por defecto');
            setValue('barrioId', 'auto-create');
          }
        }, [watchedSectorId, watchedBarrioId, barriosFiltrados.length, setValue]);

        // Resetear campos cuando cambia barrio
        useEffect(() => {
          if (!watchedBarrioId) {
            if (watchedTipoVia) {
              console.log('🧹 [CalleForm] Reseteando tipo de vía');
              setValue('tipoVia', '');
            }
            if (watchedNombre) {
              console.log('🧹 [CalleForm] Reseteando nombre');
              setValue('nombre', '');
            }
          }
        }, [watchedBarrioId, setValue, watchedTipoVia, watchedNombre]);

        // Resetear nombre cuando cambia tipo de vía
        useEffect(() => {
          if (!watchedTipoVia && watchedNombre) {
            console.log('🧹 [CalleForm] Reseteando nombre porque se quitó tipo de vía');
            setValue('nombre', '');
          }
        }, [watchedTipoVia, setValue, watchedNombre]);

        // Estados de habilitación
        const isSectorSelected = watchedSectorId && watchedSectorId !== '';
        const isBarrioSelected = watchedBarrioId && watchedBarrioId !== '';
        const isTipoViaSelected = watchedTipoVia && watchedTipoVia !== '';
        
        const isBarrioEnabled = isSectorSelected;
        const isTipoViaEnabled = isBarrioSelected;
        const isNombreEnabled = isTipoViaSelected;

        return (
          <div className="space-y-6">
            {/* Estado de carga y debug inicial */}
            {(loadingSectores || loadingBarrios) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-700">
                  {loadingSectores && '⏳ Cargando sectores...'}
                  {loadingBarrios && '⏳ Cargando barrios...'}
                </div>
              </div>
            )}

            {/* Información de sectores disponibles */}
            {!loadingSectores && sectorOptions.length === 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-700">
                  ❌ No hay sectores disponibles. Verifique la conexión con el API.
                </div>
              </div>
            )}

            {/* Primera fila: Sector y Barrio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Select de Sector */}
              <div>
                <Select
                  label={`Sector ${sectorOptions.length > 0 ? `(${sectorOptions.length} disponibles)` : ''}`}
                  options={sectorOptions}
                  error={errors.sectorId?.message}
                  disabled={loadingSectores || formState.isSubmitting || sectorOptions.length === 0}
                  placeholder={
                    loadingSectores 
                      ? "⏳ Cargando sectores..." 
                      : sectorOptions.length === 0
                      ? "❌ No hay sectores disponibles"
                      : "📍 Seleccione un sector"
                  }
                  value={watchedSectorId || ''}
                  {...register('sectorId')}
                />
                
                {/* Info adicional sobre sectores */}
                {!loadingSectores && sectorOptions.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ {sectorOptions.length} sectores cargados correctamente
                  </div>
                )}
                
                {/* Debug info para sector */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1 bg-gray-100 p-1 rounded">
                    Valor: "{watchedSectorId}" | Opciones: {sectorOptions.length} | Loading: {loadingSectores}
                  </div>
                )}
              </div>
              
              {/* 2. Select de Barrio */}
              <div>
                <Select
                  label={`Barrio ${barrioOptions.length > 0 ? `(${barriosFiltrados.length} del sector)` : ''}`}
                  options={barrioOptions}
                  error={errors.barrioId?.message}
                  disabled={!isBarrioEnabled || loadingBarrios || formState.isSubmitting}
                  placeholder={
                    !isSectorSelected 
                      ? "🔒 Primero seleccione un sector" 
                      : loadingBarrios 
                      ? "⏳ Cargando barrios..." 
                      : "🏘️ Seleccione un barrio"
                  }
                  value={watchedBarrioId || ''}
                  {...register('barrioId')}
                />
                
                {/* Info sobre barrios */}
                {isSectorSelected && barriosFiltrados.length === 0 && !loadingBarrios && (
                  <div className="text-xs text-amber-600 mt-1 flex items-center">
                    ⚠️ Este sector no tiene barrios. Se creará automáticamente.
                  </div>
                )}
                
                {/* Debug info para barrio */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1 bg-gray-100 p-1 rounded">
                    Valor: "{watchedBarrioId}" | Filtrados: {barriosFiltrados.length} | Opciones: {barrioOptions.length}
                  </div>
                )}
              </div>
            </div>

            {/* Segunda fila: Tipo de Vía y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Select de Tipo de Vía */}
              <div>
                <Select
                  label={`Tipo de vía ${tipoViaOptions.length > 0 ? `(${tipoViaOptions.length} tipos)` : ''}`}
                  options={tipoViaOptions}
                  error={errors.tipoVia?.message}
                  disabled={!isTipoViaEnabled || loadingTiposVia || formState.isSubmitting}
                  placeholder={
                    !isBarrioSelected
                      ? "🔒 Primero seleccione un barrio"
                      : loadingTiposVia
                      ? "⏳ Cargando tipos..."
                      : "🛣️ Seleccione tipo de vía"
                  }
                  value={watchedTipoVia || ''}
                  {...register('tipoVia')}
                />
                
                {/* Debug info para tipo de vía */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1 bg-gray-100 p-1 rounded">
                    Valor: "{watchedTipoVia}" | Habilitado: {isTipoViaEnabled}
                  </div>
                )}
              </div>
              
              {/* 4. Input de Nombre */}
              <div>
                <Input
                  label="Nombre de la vía"
                  error={errors.nombre?.message}
                  disabled={!isNombreEnabled || formState.isSubmitting}
                  placeholder={
                    !isTipoViaSelected
                      ? "🔒 Primero seleccione tipo de vía"
                      : "✏️ Ingrese nombre de la vía"
                  }
                  value={watchedNombre || ''}
                  {...register('nombre')}
                />
                
                {/* Debug info para nombre */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1 bg-gray-100 p-1 rounded">
                    Valor: "{watchedNombre}" | Habilitado: {isNombreEnabled}
                  </div>
                )}
              </div>
            </div>

            {/* Alerta especial para barrios auto-creados */}
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
                <div className={`flex items-center p-2 rounded ${isSectorSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isSectorSelected ? '✅' : '1️⃣'} Sector
                </div>
                <div className={`flex items-center p-2 rounded ${isBarrioSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isBarrioSelected ? '✅' : '2️⃣'} Barrio
                </div>
                <div className={`flex items-center p-2 rounded ${isTipoViaSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isTipoViaSelected ? '✅' : '3️⃣'} Tipo
                </div>
                <div className={`flex items-center p-2 rounded ${watchedNombre ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {watchedNombre ? '✅' : '4️⃣'} Nombre
                </div>
              </div>
            </div>

            {/* Debug completo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-gray-800 text-green-400 text-xs rounded font-mono">
                <div className="text-green-300 font-bold mb-2">🔧 DEBUG COMPLETO:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>sectores.length: {sectores.length}</div>
                  <div>sectorOptions.length: {sectorOptions.length}</div>
                  <div>barriosFiltrados.length: {barriosFiltrados.length}</div>
                  <div>barrioOptions.length: {barrioOptions.length}</div>
                  <div>loadingSectores: {loadingSectores.toString()}</div>
                  <div>loadingBarrios: {loadingBarrios.toString()}</div>
                  <div>formState.isValid: {formState.isValid.toString()}</div>
                  <div>formState.isSubmitting: {formState.isSubmitting.toString()}</div>
                </div>
                <div className="mt-2 text-yellow-400">
                  <div>watchedSectorId: "{watchedSectorId}"</div>
                  <div>watchedBarrioId: "{watchedBarrioId}"</div>
                  <div>watchedTipoVia: "{watchedTipoVia}"</div>
                  <div>watchedNombre: "{watchedNombre}"</div>
                </div>
                {Object.keys(errors).length > 0 && (
                  <div className="mt-2 text-red-400">
                    Errores: {JSON.stringify(errors, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }}
    </EntityForm>
  );
};

export default CalleForm;