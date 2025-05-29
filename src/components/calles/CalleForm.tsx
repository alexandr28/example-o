// src/components/calles/CalleForm.tsx - REFACTORIZADO CON SELECCIÓN JERÁRQUICA
import React, { useEffect, useState } from 'react';
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
  // Estado local para controlar el formulario
  const [sectorSeleccionado, setSectorSeleccionado] = useState<string>('');
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<string>('');
  const [tipoViaSeleccionado, setTipoViaSeleccionado] = useState<string>('');

  // Preparar opciones para los selects
  const sectorOptions = sectores.map(sector => ({
    value: sector.id?.toString() || '',
    label: sector.nombre
  }));

  const barrioOptions = barriosFiltrados.map(barrio => ({
    value: barrio.id?.toString() || '',
    label: barrio.nombre || ''
  }));

  const tipoViaOptions = tiposVia.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  // Manejar el submit del formulario
  const handleSave = (data: CalleFormDataValidated) => {
    onGuardar({
      sectorId: parseInt(data.sectorId),
      barrioId: parseInt(data.barrioId),
      tipoVia: data.tipoVia,
      nombre: data.nombre
    });
  };

  // Efecto para manejar cambio de sector
  useEffect(() => {
    if (sectorSeleccionado) {
      onSectorChange(parseInt(sectorSeleccionado));
      // Resetear barrio cuando cambia el sector
      setBarrioSeleccionado('');
    }
  }, [sectorSeleccionado, onSectorChange]);

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
        tipoVia: calleSeleccionada.tipoVia,
        nombre: calleSeleccionada.nombre
      } : null}
      onSave={handleSave}
      onNew={onNuevo}
      onEdit={onEditar}
      loading={loading || loadingSectores || loadingBarrios || loadingTiposVia}
      isEditMode={isEditMode}
      isOfflineMode={isOfflineMode}
    >
      {({ register, errors, watch, setValue, formState }) => {
        // Observar cambios en el formulario
        const watchedSectorId = watch('sectorId');
        const watchedBarrioId = watch('barrioId');
        const watchedTipoVia = watch('tipoVia');
        const watchedNombre = watch('nombre');

        // Actualizar estado local cuando cambian los valores del form
        useEffect(() => {
          if (watchedSectorId !== sectorSeleccionado) {
            setSectorSeleccionado(watchedSectorId);
          }
        }, [watchedSectorId]);

        useEffect(() => {
          if (watchedBarrioId !== barrioSeleccionado) {
            setBarrioSeleccionado(watchedBarrioId);
          }
        }, [watchedBarrioId]);

        useEffect(() => {
          if (watchedTipoVia !== tipoViaSeleccionado) {
            setTipoViaSeleccionado(watchedTipoVia);
          }
        }, [watchedTipoVia]);

        return (
          <div className="space-y-6">
            {/* Primera fila: Sector y Barrio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Select de Sector */}
              <Select
                label="Sector"
                options={sectorOptions}
                error={errors.sectorId?.message}
                disabled={loadingSectores || formState.disabled}
                placeholder={loadingSectores ? "Cargando sectores..." : "Seleccione un sector"}
                {...register('sectorId')}
              />
              
              {/* 2. Select de Barrio (se activa cuando hay un sector seleccionado) */}
              <Select
                label="Barrio"
                options={barrioOptions}
                error={errors.barrioId?.message}
                disabled={!watchedSectorId || loadingBarrios || formState.disabled}
                placeholder={
                  !watchedSectorId 
                    ? "Primero seleccione un sector" 
                    : loadingBarrios 
                    ? "Cargando barrios..." 
                    : barrioOptions.length === 0
                    ? "No hay barrios para este sector"
                    : "Seleccione un barrio"
                }
                {...register('barrioId')}
              />
            </div>

            {/* Segunda fila: Tipo de Vía y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Select de Tipo de Vía (se activa cuando hay un barrio seleccionado) */}
              <Select
                label="Tipo de vía"
                options={tipoViaOptions}
                error={errors.tipoVia?.message}
                disabled={!watchedBarrioId || loadingTiposVia || formState.disabled}
                placeholder={
                  !watchedBarrioId
                    ? "Primero seleccione un barrio"
                    : loadingTiposVia
                    ? "Cargando tipos de vía..."
                    : "Seleccione tipo de vía"
                }
                {...register('tipoVia')}
              />
              
              {/* 4. Input de Nombre (se activa cuando hay un tipo de vía seleccionado) */}
              <Input
                label="Nombre"
                error={errors.nombre?.message}
                disabled={!watchedTipoVia || formState.disabled}
                placeholder={
                  !watchedTipoVia
                    ? "Primero seleccione tipo de vía"
                    : "Ingrese nombre de la vía"
                }
                {...register('nombre')}
              />
            </div>

            {/* Preview de la dirección completa */}
            {watchedSectorId && watchedBarrioId && watchedTipoVia && watchedNombre && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Vista previa de la calle:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    <span className="font-medium">Ubicación:</span> {' '}
                    {sectores.find(s => s.id?.toString() === watchedSectorId)?.nombre || 'N/A'} - {' '}
                    {barriosFiltrados.find(b => b.id?.toString() === watchedBarrioId)?.nombre || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Calle completa:</span> {' '}
                    {tiposVia.find(t => t.value === watchedTipoVia)?.descripcion || watchedTipoVia} {watchedNombre}
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional en modo ver */}
            {!isEditMode && calleSeleccionada && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Información adicional:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">ID:</span> {calleSeleccionada.id}</div>
                  {calleSeleccionada.codTipoVia && (
                    <div><span className="font-medium">Código tipo vía:</span> {calleSeleccionada.codTipoVia}</div>
                  )}
                  {calleSeleccionada.estado !== undefined && (
                    <div>
                      <span className="font-medium">Estado:</span> {' '}
                      <span className={calleSeleccionada.estado ? 'text-green-600' : 'text-red-600'}>
                        {calleSeleccionada.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )}
                  {calleSeleccionada.fechaCreacion && (
                    <div>
                      <span className="font-medium">Creado:</span> {' '}
                      {new Date(calleSeleccionada.fechaCreacion).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instrucciones de ayuda */}
            {isEditMode && !calleSeleccionada && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-sm font-medium text-green-900 mb-1">💡 Instrucciones:</h4>
                <ol className="text-xs text-green-700 list-decimal list-inside space-y-1">
                  <li>Seleccione primero el <strong>Sector</strong> donde se ubica la calle</li>
                  <li>Luego seleccione el <strong>Barrio</strong> específico dentro del sector</li>
                  <li>Elija el <strong>Tipo de vía</strong> (Avenida, Calle, Jirón, etc.)</li>
                  <li>Finalmente ingrese el <strong>Nombre</strong> de la vía (sin incluir el tipo)</li>
                </ol>
              </div>
            )}

            {/* Debug info en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-800 text-green-400 text-xs rounded font-mono">
                <div>🔧 Debug - Estado del formulario:</div>
                <div>Sector: {watchedSectorId || 'No seleccionado'}</div>
                <div>Barrio: {watchedBarrioId || 'No seleccionado'} (Opciones: {barrioOptions.length})</div>
                <div>Tipo vía: {watchedTipoVia || 'No seleccionado'}</div>
                <div>Nombre: {watchedNombre || 'Vacío'}</div>
                <div>Formulario válido: {formState.isValid ? 'Sí' : 'No'}</div>
              </div>
            )}
          </div>
        );
      }}
    </EntityForm>
  );
};

export default CalleForm;