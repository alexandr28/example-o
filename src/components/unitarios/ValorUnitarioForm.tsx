import React from 'react';
import { Input, Select } from '../';
import { CategoriaValorUnitario, SubcategoriaValorUnitario, LetraValorUnitario } from '../../models';

interface ValorUnitarioFormProps {
  años: { value: string, label: string }[];
  categorias: { value: string, label: string }[];
  subcategoriasDisponibles: { value: string, label: string }[];
  letras: { value: string, label: string }[];
  añoSeleccionado: number | null;
  categoriaSeleccionada: CategoriaValorUnitario | null;
  subcategoriaSeleccionada: SubcategoriaValorUnitario | null;
  letraSeleccionada: LetraValorUnitario | null;
  loading: boolean;
  onAñoChange: (año: number | null) => void;
  onCategoriaChange: (categoria: CategoriaValorUnitario | null) => void;
  onSubcategoriaChange: (subcategoria: SubcategoriaValorUnitario | null) => void;
  onLetraChange: (letra: LetraValorUnitario | null) => void;
  onCostoChange: (costo: string) => void;
  costoValue: string;
}

const ValorUnitarioForm: React.FC<ValorUnitarioFormProps> = ({
  años,
  categorias,
  subcategoriasDisponibles,
  letras,
  añoSeleccionado,
  categoriaSeleccionada,
  subcategoriaSeleccionada,
  letraSeleccionada,
  loading,
  onAñoChange,
  onCategoriaChange,
  onSubcategoriaChange,
  onLetraChange,
  onCostoChange,
  costoValue
}) => {
  // Manejar cambio en el año
  const handleAñoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onAñoChange(value ? parseInt(value) : null);
  };

  // Manejar cambio en la categoría
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCategoriaChange(value ? value as CategoriaValorUnitario : null);
  };

  // Manejar cambio en la subcategoría
  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSubcategoriaChange(value ? value as SubcategoriaValorUnitario : null);
  };

  // Manejar cambio en la letra
  const handleLetraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onLetraChange(value ? value as LetraValorUnitario : null);
  };

  // Manejar cambio en el costo
  const handleCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCostoChange(e.target.value);
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden w-3/4">
      <div className="px-6 py-3 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Valores Unitarios</h2>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Fila 1: Año y Categoría */}
          <div>
            <Select
              label="Años"
              options={años}
              placeholder="Seleccione"
              value={añoSeleccionado?.toString() || ''}
              onChange={handleAñoChange}
              disabled={loading}
            />
          </div>
          
          <div>
            <Select
              label="Categorías"
              options={categorias}
              placeholder="Seleccione"
              value={categoriaSeleccionada || ''}
              onChange={handleCategoriaChange}
              disabled={loading || !añoSeleccionado}
            />
          </div>
          
          {/* Fila 2: Subcategoría y Letra */}
          <div>
            <Select
              label="Subcategorías"
              options={subcategoriasDisponibles}
              placeholder="Seleccione"
              value={subcategoriaSeleccionada || ''}
              onChange={handleSubcategoriaChange}
              disabled={loading || !categoriaSeleccionada}
            />
          </div>
          
          <div>
            <Select
              label="Letra"
              options={letras}
              placeholder="Seleccione"
              value={letraSeleccionada || ''}
              onChange={handleLetraChange}
              disabled={loading || !subcategoriaSeleccionada}
            />
          </div>
          
          {/* Fila 3: Costo */}
          <div className="col-span-2">
            <Input
              label="Costo"
              type="number"
              step="0.01"
              value={costoValue}
              onChange={handleCostoChange}
              disabled={loading || !letraSeleccionada}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValorUnitarioForm;