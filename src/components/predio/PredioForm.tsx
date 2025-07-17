// src/components/predio/PredioFormUpdated.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Skeleton,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import {
  Home as HomeIcon,
  Save as SaveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { 
  useCondicionPropiedadOptions,
  useTipoPredioOptions,
  useConstantesOptions
} from '../../hooks/useConstantesOptions';
import { ConstanteService } from '../../services/constanteService';

interface PredioFormData {
  condicionPropiedad: string;
  tipoPredio: string;
  conductor: string;
  usoPredio: string;
  estadoPredio: string;
  modoDeclaracion: string;
  codigoContribuyente?: number;
  // Agregar otros campos según sea necesario
}

interface PredioFormProps {
  codPersona?: number;
  predioExistente?: any;
  onSubmit?: (data: PredioFormData) => void;
  onCancel?: () => void;
}

const PredioFormUpdated: React.FC<PredioFormProps> = ({
  codPersona,
  predioExistente,
  onSubmit,
  onCancel
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PredioFormData>({
    defaultValues: {
      condicionPropiedad: predioExistente?.condicionPropiedad || '',
      tipoPredio: predioExistente?.tipoPredio || '',
      conductor: predioExistente?.conductor || '',
      usoPredio: predioExistente?.usoPredio || '',
      estadoPredio: predioExistente?.estadoPredio || '',
      modoDeclaracion: predioExistente?.modoDeclaracion || '',
      codigoContribuyente: codPersona
    }
  });

  // Cargar opciones usando hooks personalizados
  const { 
    options: condicionPropiedadOptions, 
    loading: loadingCondicion,
    error: errorCondicion 
  } = useCondicionPropiedadOptions();

  const { 
    options: tipoPredioOptions, 
    loading: loadingTipoPredio,
    error: errorTipoPredio 
  } = useTipoPredioOptions();

  const { 
    options: conductorOptions, 
    loading: loadingConductor,
    error: errorConductor 
  } = useConstantesOptions(
    () => ConstanteService.getInstance().obtenerTiposListaConductor()
  );

  const { 
    options: usoPredioOptions, 
    loading: loadingUsoPredio,
    error: errorUsoPredio 
  } = useConstantesOptions(
    () => ConstanteService.getInstance().obtenerTiposListaUsos()
  );

  const { 
    options: estadoPredioOptions, 
    loading: loadingEstadoPredio,
    error: errorEstadoPredio 
  } = useConstantesOptions(
    () => ConstanteService.getInstance().obtenerNombreTipoEstadoPredio()
  );

  const { 
    options: modoDeclaracionOptions, 
    loading: loadingModoDeclaracion,
    error: errorModoDeclaracion 
  } = useConstantesOptions(
    () => constanteService.obtenerTiposModoDeclaracion()
  );

  // Verificar si algún campo está cargando
  const isLoadingOptions = loadingCondicion || loadingTipoPredio || 
                          loadingConductor || loadingUsoPredio || 
                          loadingEstadoPredio || loadingModoDeclaracion;

  // Verificar si hay errores en la carga
  const hasLoadingErrors = errorCondicion || errorTipoPredio || 
                          errorConductor || errorUsoPredio || 
                          errorEstadoPredio || errorModoDeclaracion;

  const onFormSubmit = (data: PredioFormData) => {
    console.log('Datos del formulario:', data);
    if (onSubmit) {
      onSubmit(data);
    }
  };

  // Función helper para renderizar un Select con loading
  const renderSelect = (
    name: keyof PredioFormData,
    label: string,
    options: any[],
    loading: boolean,
    error: string | null,
    required: boolean = true
  ) => {
    if (loading) {
      return (
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Skeleton variant="rectangular" height={56} />
        </FormControl>
      );
    }

    return (
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label} es requerido` : false }}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name] || !!error}>
            <InputLabel>{label}</InputLabel>
            <Select
              {...field}
              label={label}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Seleccione...</em>
              </MenuItem>
              {options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(errors[name] || error) && (
              <FormHelperText>
                {errors[name]?.message || error}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon color="primary" />
            <Typography variant="h6" component="h2">
              {predioExistente ? 'Editar Predio' : 'Registrar Nuevo Predio'}
            </Typography>
          </Box>

          {/* Mostrar alerta si hay errores de carga */}
          {hasLoadingErrors && (
            <Alert severity="warning" icon={<WarningIcon />}>
              Algunas opciones no pudieron cargarse correctamente. 
              Se están usando valores por defecto.
            </Alert>
          )}

          {/* Información del contribuyente */}
          {codPersona && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Código Contribuyente:</strong> {codPersona}
              </Typography>
            </Alert>
          )}

          {/* Campos del formulario */}
          <Grid container spacing={3}>
            {/* Primera fila */}
            <Grid item xs={12} md={6}>
              {renderSelect(
                'condicionPropiedad',
                'Condición de Propiedad',
                condicionPropiedadOptions,
                loadingCondicion,
                errorCondicion
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderSelect(
                'tipoPredio',
                'Tipo de Predio',
                tipoPredioOptions,
                loadingTipoPredio,
                errorTipoPredio
              )}
            </Grid>

            {/* Segunda fila */}
            <Grid item xs={12} md={6}>
              {renderSelect(
                'conductor',
                'Conductor',
                conductorOptions,
                loadingConductor,
                errorConductor
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderSelect(
                'usoPredio',
                'Uso del Predio',
                usoPredioOptions,
                loadingUsoPredio,
                errorUsoPredio
              )}
            </Grid>

            {/* Tercera fila */}
            <Grid item xs={12} md={6}>
              {renderSelect(
                'estadoPredio',
                'Estado del Predio',
                estadoPredioOptions,
                loadingEstadoPredio,
                errorEstadoPredio
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderSelect(
                'modoDeclaracion',
                'Modo de Declaración',
                modoDeclaracionOptions,
                loadingModoDeclaracion,
                errorModoDeclaracion
              )}
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            {onCancel && (
              <Button 
                variant="outlined" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={isSubmitting || isLoadingOptions}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Predio'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default PredioFormUpdated;