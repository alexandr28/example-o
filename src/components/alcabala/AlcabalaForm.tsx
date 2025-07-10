// src/components/alcabala/AlcabalaForm.tsx
import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';
import Alcabala from './Alcabala';
import AlcabalaList from './AlcabalaList';
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
  onEditar?: (alcabala: any) => void;
  onEliminar?: (alcabala: any) => void;
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
  loading = false,
  onEditar,
  onEliminar
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Alcabala 
          aniosDisponibles={aniosDisponibles}
          anioSeleccionado={anioSeleccionado}
          tasa={tasa}
          onAnioChange={onAnioChange}
          onTasaChange={onTasaChange}
          onRegistrar={onRegistrar}
          loading={loading}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <AlcabalaList 
          alcabalas={alcabalas}
          paginacion={paginacion}
          onCambiarPagina={onCambiarPagina}
          loading={loading}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      </Grid>
    </Grid>
  );
};

export default AlcabalaForm;