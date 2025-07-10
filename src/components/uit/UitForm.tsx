// src/components/uit/UitForm.tsx
import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <UIT 
          aniosDisponibles={aniosDisponibles}
          anioSeleccionado={anioSeleccionado}
          montoCalculo={montoCalculo}
          onAnioChange={onAnioChange}
          onMontoChange={onMontoChange}
          onCalcular={onCalcular}
          loading={loading}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <AlicuotaComponent 
          alicuotas={alicuotas}
          onActualizarAlicuotas={onActualizarAlicuotas}
          editable={editable}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
};

export default UitForm;