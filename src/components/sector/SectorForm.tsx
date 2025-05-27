// src/components/sector/SectorForm.tsx
import React from 'react';
import { z } from 'zod';
import { EntityForm } from '../EntityForm';
import Input from '../ui/Input';
import { Sector } from '../../models/Sector';

// Schema de validación para el formulario
const sectorSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre del sector es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface SectorFormProps {
  sectorSeleccionado?: Sector | null;
  onGuardar: (data: { nombre: string }) => void;
  onNuevo: () => void;
  onEditar: () => void;
  modoOffline?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sectorSeleccionado,
  onGuardar,
  onNuevo,
  onEditar,
  modoOffline = false,
  loading = false,
  isEditMode = false,
}) => {
  return (
    <EntityForm<SectorFormData>
      title="Datos del sector"
      schema={sectorSchema}
      defaultValues={{ nombre: '' }}
      selectedItem={sectorSeleccionado}
      onSave={onGuardar}
      onNew={onNuevo}
      onEdit={onEditar}
      loading={loading}
      isEditMode={isEditMode}
      isOfflineMode={modoOffline}
    >
      {({ register, errors }) => (
        <div className="grid grid-cols-1 gap-6">
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            placeholder="Ingrese nombre del sector"
            {...register('nombre')}
          />
        </div>
      )}
    </EntityForm>
  );
};

export default SectorForm;