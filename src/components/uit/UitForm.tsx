import React from 'react';
import UIT from './UIT';
import AlicuotaComponent from './Alicuota';
import { Alicuota } from '../../models/UIT';

interface UitFormProps {
  aniosDisponibles: { value: string, label: string }[];
  anioSeleccionado: number | null;
  montoCalculo: number;
  alicuotas: Alicuota[];
  onAnioChange: (anio: number | null) => void;
  onMontoChange: (monto: number) => void;
  onCalcular: () => void;
  onActualizarAlicuotas?: (alicuotas: Alicuota[]) => void;
  loading?: boolean;
  editable?: boolean;
}

/**
 * Componente que integra UIT y Alicuota en un formulario completo
 */
const UitForm: React.FC<UitFormProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  montoCalculo,
  alicuotas,
  onAnioChange,
  onMontoChange,
  onCalcular,
  onActualizarAlicuotas,
  loading = false,
  editable = true
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UIT 
        aniosDisponibles={aniosDisponibles}
        anioSeleccionado={anioSeleccionado}
        montoCalculo={montoCalculo}
        onAnioChange={onAnioChange}
        onMontoChange={onMontoChange}
        onCalcular={onCalcular}
        loading={loading}
      />
      
      <AlicuotaComponent 
        alicuotas={alicuotas}
        onActualizarAlicuotas={onActualizarAlicuotas}
        editable={editable}
        loading={loading}
      />
    </div>
  );
};

export default UitForm;