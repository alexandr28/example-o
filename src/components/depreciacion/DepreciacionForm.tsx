import React from 'react';
import Depreciacion from './Depreciacion';
import BuscarDepreciacion from './BuscarDepreciacion';
import { Depreciacion as DepreciacionModel } from '../../models/Depreciacion';

interface DepreciacionFormProps {
  aniosDisponibles: { value: string, label: string }[];
  tiposCasa: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tipoCasaSeleccionado: string | null;
  depreciaciones: DepreciacionModel[];
  onAnioChange: (anio: number | null) => void;
  onTipoCasaChange: (tipoCasa: string | null) => void;
  onRegistrar: () => void;
  onBuscar: () => void;
  loading?: boolean;
}

/**
 * Componente que integra Depreciacion y BuscarDepreciacion en un formulario completo
 */
const DepreciacionForm: React.FC<DepreciacionFormProps> = ({
  aniosDisponibles,
  tiposCasa,
  anioSeleccionado,
  tipoCasaSeleccionado,
  depreciaciones,
  onAnioChange,
  onTipoCasaChange,
  onRegistrar,
  onBuscar,
  loading = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Depreciacion 
        aniosDisponibles={aniosDisponibles}
        tiposCasa={tiposCasa}
        anioSeleccionado={anioSeleccionado}
        tipoCasaSeleccionado={tipoCasaSeleccionado}
        onAnioChange={onAnioChange}
        onTipoCasaChange={onTipoCasaChange}
        onRegistrar={onRegistrar}
        loading={loading}
      />
      
      <BuscarDepreciacion 
        aniosDisponibles={aniosDisponibles}
        tiposCasa={tiposCasa}
        anioSeleccionado={anioSeleccionado}
        tipoCasaSeleccionado={tipoCasaSeleccionado}
        onAnioChange={onAnioChange}
        onTipoCasaChange={onTipoCasaChange}
        onBuscar={onBuscar}
        loading={loading}
      />
    </div>
  );
};

export default DepreciacionForm;