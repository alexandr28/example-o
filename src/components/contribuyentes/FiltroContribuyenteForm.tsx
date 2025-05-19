import React from 'react';
import { Input, Select, Button } from '../../components';
import { Filter } from 'lucide-react';

interface FiltroContribuyenteFormProps {
  tipoContribuyente: string;
  busqueda: string;
  onTipoContribuyenteChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBusquedaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBuscar: () => void;
}

/**
 * Componente de formulario para filtrar contribuyentes
 */
const FiltroContribuyenteForm: React.FC<FiltroContribuyenteFormProps> = ({
  tipoContribuyente,
  busqueda,
  onTipoContribuyenteChange,
  onBusquedaChange,
  onBuscar
}) => {
  // Opciones para el selector de tipo de contribuyente
  const tipoContribuyenteOptions = [
    
    { value: 'natural', label: 'Persona Natural' },
    { value: 'juridica', label: 'Persona Jurídica' },
  ];

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Filtro de contribuyentes</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo contribuyente</label>
            <Select
              options={tipoContribuyenteOptions}
              value={tipoContribuyente}
              onChange={onTipoContribuyenteChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por</label>
            <div className="flex">
              <Input
                placeholder="Buscar contribuyente"
                value={busqueda}
                onChange={onBusquedaChange}
                className="rounded-r-none"
              />
              <Button
                className="rounded-l-none bg-blue-600 hover:bg-blue-700 flex items-center"
                onClick={onBuscar}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltroContribuyenteForm;