// src/components/barrio/BarrioForm.tsx - REFACTORIZADO
import React from 'react';
import { z } from 'zod';
import { EntityForm } from '../EntityForm';
import { Input, Select } from '../';
import { Barrio, Sector } from '../../models/';

// Schema de validación para el formulario
const barrioSchema = z.object({
  sectorId: z.string().min(1, 'Debe seleccionar un sector'),
  nombre: z.string()
    .min(1, 'El nombre del barrio es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
});

type BarrioFormData = z.infer<typeof barrioSchema>;

interface BarrioFormProps {
  barrioSeleccionado?: Barrio | null;
  sectores: Sector[];
  onGuardar: (data: { nombre: string, sectorId: number }) => void;
  onNuevo: () => void;
  onEditar: () => void;
  loading?: boolean;
  loadingSectores?: boolean;
  isEditMode?: boolean;
  isOfflineMode?: boolean;
}

const BarrioForm: React.FC<BarrioFormProps> = ({
  barrioSeleccionado,
  sectores,
  onGuardar,
  onNuevo,
  onEditar,
  loading = false,
  loadingSectores = false,
  isEditMode = false,
  isOfflineMode = false,
}) => {
  // Convertir sectores al formato requerido para el Select
  const sectorOptions = sectores.map(sector => ({
    value: sector.id?.toString() || '',
    label: sector.nombre
  }));

  // Manejar el submit del formulario
  const handleSave = (data: BarrioFormData) => {
    onGuardar({
      nombre: data.nombre,
      sectorId: parseInt(data.sectorId)
    });
  };

  return (
    <EntityForm<BarrioFormData>
      title="Datos del barrio"
      schema={barrioSchema}
      defaultValues={{ 
        sectorId: '', 
        nombre: '' 
      }}
      selectedItem={barrioSeleccionado ? {
        sectorId: barrioSeleccionado.sectorId.toString(),
        nombre: barrioSeleccionado.nombre || ''
      } : null}
      onSave={handleSave}
      onNew={onNuevo}
      onEdit={onEditar}
      loading={loading || loadingSectores}
      isEditMode={isEditMode}
      isOfflineMode={isOfflineMode}
    >
      {({ register, errors, watch, formState }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Sector"
            options={sectorOptions}
            error={errors.sectorId?.message}
            disabled={loadingSectores}
            placeholder={loadingSectores ? "Cargando sectores..." : "Seleccione un sector"}
            {...register('sectorId')}
          />
          
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            placeholder="Ingrese nombre del barrio"
            {...register('nombre')}
          />
          
          {/* Mostrar información del sector seleccionado */}
          {watch('sectorId') && !isEditMode && (
            <div className="col-span-2 mt-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Sector seleccionado:</span> {' '}
                  {sectores.find(s => s.id?.toString() === watch('sectorId'))?.nombre || 'N/A'}
                </p>
              </div>
            </div>
          )}
          
          {/* Información adicional en modo ver */}
          {!isEditMode && barrioSeleccionado && (
            <div className="col-span-2 mt-2">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">ID:</span> {barrioSeleccionado.id}</div>
                  {barrioSeleccionado.codBarrio && (
                    <div><span className="font-medium">Código:</span> {barrioSeleccionado.codBarrio}</div>
                  )}
                  {barrioSeleccionado.fechaCreacion && (
                    <div>
                      <span className="font-medium">Creado:</span> {' '}
                      {new Date(barrioSeleccionado.fechaCreacion).toLocaleString()}
                    </div>
                  )}
                  {barrioSeleccionado.estado !== undefined && (
                    <div>
                      <span className="font-medium">Estado:</span> {' '}
                      <span className={barrioSeleccionado.estado ? 'text-green-600' : 'text-red-600'}>
                        {barrioSeleccionado.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </EntityForm>
  );
};

export default BarrioForm;