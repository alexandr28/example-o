import React from 'react';
import {AlcabalaList,Alcabala} from '../../components';
import { PaginacionOptions } from '../../models/Alcabala';

interface AlcabalaFormProps {
  aniosDisponibles: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tasa: number;
  alcabalas: any[];
  paginacion: PaginacionOptions;
  onAnioChange: (anio: number | null) => void;
  onTasaChange: (tasa: number) => void;
  onRegistrar: () => void;
  onCambiarPagina: (pagina: number) => void;
  loading?: boolean;
}

/**
 * Componente que integra Alcabala y AlcabalaList en un formulario completo
 */
const AlcabalaForm: React.FC<AlcabalaFormProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  tasa,
  alcabalas,
  paginacion,
  onAnioChange,
  onTasaChange,
  onRegistrar,
  onCambiarPagina,
  loading = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Alcabala 
        aniosDisponibles={aniosDisponibles}
        anioSeleccionado={anioSeleccionado}
        tasa={tasa}
        onAnioChange={onAnioChange}
        onTasaChange={onTasaChange}
        onRegistrar={onRegistrar}
        loading={loading}
      />
      
      <AlcabalaList 
        alcabalas={alcabalas}
        paginacion={paginacion}
        onCambiarPagina={onCambiarPagina}
        loading={loading}
      />
    </div>
  );
};

export default AlcabalaForm;