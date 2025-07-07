// src/components/direccion/DireccionForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Divider,
  FormHelperText,
  SelectChangeEvent,
  Autocomplete
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Esquema de validación
const direccionSchema = z.object({
  sector: z.string().min(1, 'El sector es requerido'),
  barrio: z.string().min(1, 'El barrio es requerido'),
  calleMz: z.string().min(1, 'La calle/Mz es requerida'),
  cuadra: z.string().optional(),
  lado: z.enum(['Ninguno', 'Izquierdo', 'Derecho', 'Ambos']).default('Ninguno'),
  loteInicial: z.number().min(1, 'El lote inicial debe ser mayor a 0'),
  loteFinal: z.number().min(1, 'El lote final debe ser mayor a 0')
}).refine((data) => data.loteFinal >= data.loteInicial, {
  message: 'El lote final debe ser mayor o igual al lote inicial',
  path: ['loteFinal']
});

// Tipos
type DireccionFormData = z.infer<typeof direccionSchema>;

interface DireccionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DireccionFormData) => void;
  initialData?: Partial<DireccionFormData>;
  title?: string;
  mode?: 'create' | 'edit';
}

// Mock data - Esto vendría de tu API
const mockSectores = [
  { id: 1, nombre: 'Sector Centro' },
  { id: 2, nombre: 'Sector Norte' },
  { id: 3, nombre: 'Sector Sur' },
  { id: 4, nombre: 'Sector Este' },
  { id: 5, nombre: 'Sector Oeste' }
];

const mockBarrios = [
  { id: 1, nombre: 'Barrio San José', sectorId: 1 },
  { id: 2, nombre: 'Barrio Las Flores', sectorId: 1 },
  { id: 3, nombre: 'Barrio El Carmen', sectorId: 2 },
  { id: 4, nombre: 'Barrio La Victoria', sectorId: 2 },
  { id: 5, nombre: 'Barrio San Martín', sectorId: 3 }
];

const mockCalles = [
  { id: 1, nombre: 'Av. Principal', barrioId: 1 },
  { id: 2, nombre: 'Jr. Los Olivos', barrioId: 1 },
  { id: 3, nombre: 'Calle Las Rosas', barrioId: 2 },
  { id: 4, nombre: 'Mz. A', barrioId: 2 },
  { id: 5, nombre: 'Mz. B', barrioId: 2 }
];

const ladoOptions = [
  { value: 'Ninguno', label: 'Ninguno' },
  { value: 'Izquierdo', label: 'Izquierdo' },
  { value: 'Derecho', label: 'Derecho' },
  { value: 'Ambos', label: 'Ambos' }
];

const DireccionForm: React.FC<DireccionFormProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  title = 'Nueva Dirección',
  mode = 'create'
}) => {
  const [barriosFiltrados, setBarriosFiltrados] = useState(mockBarrios);
  const [callesFiltradas, setCallesFiltradas] = useState(mockCalles);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<DireccionFormData>({
    resolver: zodResolver(direccionSchema),
    defaultValues: {
      sector: '',
      barrio: '',
      calleMz: '',
      cuadra: '',
      lado: 'Ninguno',
      loteInicial: 1,
      loteFinal: 1,
      ...initialData
    }
  });

  const sectorValue = watch('sector');
  const barrioValue = watch('barrio');

  // Filtrar barrios cuando cambia el sector
  useEffect(() => {
    if (sectorValue) {
      const sectorId = mockSectores.find(s => s.nombre === sectorValue)?.id;
      const barriosDelSector = mockBarrios.filter(b => b.sectorId === sectorId);
      setBarriosFiltrados(barriosDelSector);
      
      // Limpiar barrio y calle si el sector cambió
      setValue('barrio', '');
      setValue('calleMz', '');
    }
  }, [sectorValue, setValue]);

  // Filtrar calles cuando cambia el barrio
  useEffect(() => {
    if (barrioValue) {
      const barrioId = mockBarrios.find(b => b.nombre === barrioValue)?.id;
      const callesDelBarrio = mockCalles.filter(c => c.barrioId === barrioId);
      setCallesFiltradas(callesDelBarrio);
      
      // Limpiar calle si el barrio cambió
      setValue('calleMz', '');
    }
  }, [barrioValue, setValue]);

  const onSubmit = async (data: DireccionFormData) => {
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error al guardar dirección:', error);
    }
  };

  const handleNuevo = () => {
    reset({
      sector: '',
      barrio: '',
      calleMz: '',
      cuadra: '',
      lado: 'Ninguno',
      loteInicial: 1,
      loteFinal: 1
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Primera fila: Sector, Barrio, Calle/Mz */}
            <Grid item xs={12} md={4}>
              <Controller
                name="sector"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sector}>
                    <InputLabel required>Sector</InputLabel>
                    <Select
                      {...field}
                      label="Sector"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>Seleccione un sector</em>
                      </MenuItem>
                      {mockSectores.map((sector) => (
                        <MenuItem key={sector.id} value={sector.nombre}>
                          {sector.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sector && (
                      <FormHelperText>{errors.sector.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="barrio"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.barrio} disabled={!sectorValue}>
                    <InputLabel required>Barrio</InputLabel>
                    <Select
                      {...field}
                      label="Barrio"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>Seleccione un barrio</em>
                      </MenuItem>
                      {barriosFiltrados.map((barrio) => (
                        <MenuItem key={barrio.id} value={barrio.nombre}>
                          {barrio.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.barrio && (
                      <FormHelperText>{errors.barrio.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="calleMz"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.calleMz} disabled={!barrioValue}>
                    <InputLabel required>Calle / Mz</InputLabel>
                    <Select
                      {...field}
                      label="Calle / Mz"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>Seleccione una calle</em>
                      </MenuItem>
                      {callesFiltradas.map((calle) => (
                        <MenuItem key={calle.id} value={calle.nombre}>
                          {calle.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.calleMz && (
                      <FormHelperText>{errors.calleMz.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Segunda fila: Cuadra, Lado, Lote inicial, Lote final */}
            <Grid item xs={12} md={3}>
              <Controller
                name="cuadra"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cuadra"
                    placeholder="Ej: 20"
                    error={!!errors.cuadra}
                    helperText={errors.cuadra?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="lado"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.lado}>
                    <InputLabel required>Lado</InputLabel>
                    <Select
                      {...field}
                      label="Lado"
                    >
                      {ladoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.lado && (
                      <FormHelperText>{errors.lado.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="loteInicial"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Lote inicial"
                    type="number"
                    required
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                    error={!!errors.loteInicial}
                    helperText={errors.loteInicial?.message}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="loteFinal"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Lote final"
                    type="number"
                    required
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                    error={!!errors.loteFinal}
                    helperText={errors.loteFinal?.message}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            Guardar
          </Button>
          
          {mode === 'create' && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                disabled
                sx={{ minWidth: 120 }}
              >
                Editar
              </Button>
              
              <Button
                onClick={handleNuevo}
                variant="contained"
                color="inherit"
                startIcon={<AddIcon />}
                sx={{ minWidth: 120 }}
              >
                Nuevo
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DireccionForm;