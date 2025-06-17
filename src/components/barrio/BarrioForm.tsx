// src/components/barrio/BarrioForm.tsx
import React, { FC, useEffect, useState } from 'react';
import { BarrioFormData } from '../../models/Barrio';
import { Sector } from '../../models/Sector';

interface BarrioFormProps {
  initialData?: BarrioFormData;
  sectores: Sector[];
  onSubmit: (data: BarrioFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BarrioForm: FC<BarrioFormProps> = ({
  initialData,
  sectores,
  onSubmit,
  onCancel,
  loading = false
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState<BarrioFormData>({
    nombre: '',
    sectorId: null,
    estado: 1
  });
  
  // Estado para el sector seleccionado (para debugging)
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');

  // Inicializar con datos si es edición
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedSectorId(initialData.sectorId?.toString() || '');
    }
  }, [initialData]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio en el select de sector
  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('🔄 Sector seleccionado:', value);
    
    setSelectedSectorId(value);
    setFormData(prev => ({
      ...prev,
      sectorId: value ? Number(value) : null
    }));
  };

  // Manejar submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre del barrio es requerido');
      return;
    }
    
    if (!formData.sectorId) {
      alert('Debe seleccionar un sector');
      return;
    }
    
    console.log('📤 Enviando datos del barrio:', formData);
    onSubmit(formData);
  };

  // Obtener el nombre del sector seleccionado
  const sectorSeleccionado = sectores.find(s => s.id === formData.sectorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? 'Editar Barrio' : 'Nuevo Barrio'}
        </h3>
        
        {/* Campo Sector */}
        <div className="mb-4">
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
            Sector <span className="text-red-500">*</span>
            {sectores.length > 0 && <span className="text-gray-500 text-xs ml-2">({sectores.length} opciones)</span>}
          </label>
          
          <select
            id="sector"
            name="sectorId"
            value={selectedSectorId}
            onChange={handleSectorChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || sectores.length === 0}
            required
          >
            <option value="">Seleccione un sector</option>
            {sectores.map(sector => (
              <option key={sector.id} value={sector.id.toString()}>
                {sector.nombre}
              </option>
            ))}
          </select>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-1">
              <div>Valor actual: {selectedSectorId || 'ninguno'}</div>
              <div>Opciones: {sectores.map(s => `${s.id}:${s.nombre}`).join(', ')}</div>
            </div>
          )}
        </div>
        
        {/* Mostrar sector seleccionado */}
        {sectorSeleccionado && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <span className="text-sm text-blue-700">
              Sector seleccionado: {sectorSeleccionado.nombre}
            </span>
          </div>
        )}
        
        {/* Campo Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Barrio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese nombre del barrio"
            disabled={loading}
            required
          />
        </div>
        
        {/* Botones */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !formData.nombre || !formData.sectorId}
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BarrioForm;