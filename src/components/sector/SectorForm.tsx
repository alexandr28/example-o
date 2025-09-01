// src/components/sector/SectorForm.tsx - Versión Material-UI
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Autocomplete
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { Sector } from "../../models/Sector";
import { useSectores } from "../../hooks/useSectores";

// Schema de validación
const sectorSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del sector es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),
  cuadrante: z
    .number()
    .int("El cuadrante debe ser un número entero")
    .min(0, "El cuadrante debe ser un número positivo")
    .optional(),
  descripcion: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 200, "La descripción no puede exceder los 200 caracteres")
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface SectorFormProps {
  sectorSeleccionado?: Sector | null;
  onGuardar: (data: { nombre: string; cuadrante?: number; descripcion?: string }) => void | Promise<void>;
  onNuevo: () => void;
  onEditar?: () => void;
  modoOffline?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sectorSeleccionado,
  onGuardar,
  onNuevo,
  onEditar,
  modoOffline = false,
  loading = false,
  isEditMode = false,
}) => {
  const { cuadrantes, loadingCuadrantes, cargarCuadrantes } = useSectores();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue,
    watch,
    control,
  } = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: { nombre: "", cuadrante: undefined, descripcion: "" },
    mode: "onChange",
  });

  // Observar el valor del nombre
  const nombreValue = watch("nombre");

  // Estado para debug
  // const [showDebug] = React.useState(false);

  // Cargar cuadrantes al montar
  useEffect(() => {
    cargarCuadrantes();
  }, [cargarCuadrantes]);

  // Actualizar formulario cuando cambia el sector seleccionado
  useEffect(() => {
    if (sectorSeleccionado) {
      setValue("nombre", sectorSeleccionado.nombre || "");
      setValue("cuadrante", sectorSeleccionado.cuadrante || undefined);
      setValue("descripcion", sectorSeleccionado.descripcion || "");
    } else {
      reset({ nombre: "", cuadrante: undefined, descripcion: "" });
    }
  }, [sectorSeleccionado, setValue, reset]);

  const onSubmit = async (data: SectorFormData) => {
    try {
      await onGuardar(data);
      if (!isEditMode) {
        reset({ nombre: "", cuadrante: undefined, descripcion: "" });
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleNew = () => {
    reset({ nombre: "", cuadrante: undefined, descripcion: "" });
    onNuevo();
  };

  const isFormDisabled = Boolean(loading || (sectorSeleccionado && !isEditMode));

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 1.5, sm: 2 },
        pb: 1,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider',
        width: { xs: '100%', sm: '100%', md: '80%', lg: '100%' },
        mx: 'auto'
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      
        

        {/* Fila única con todos los campos del formulario */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'column', md: 'row' },
          flexWrap: 'wrap', 
          gap: { xs: 1.5, sm: 2 },
          mb: 1.5,
          alignItems: { xs: 'stretch', sm: 'stretch', md: 'center' }
        }}>
          {/* Nombre del Sector */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
            minWidth: { xs: '100%', sm: '250px' } 
          }}>
            <TextField
              {...register("nombre")}
              label="Nombre del Sector *"
              placeholder="Ingrese el nombre del sector"
              fullWidth
              size="small"
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              disabled={isFormDisabled}
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: nombreValue && !isFormDisabled && (
                  <Tooltip title="Limpiar">
                    <IconButton
                      size="small"
                      onClick={() => setValue("nombre", "")}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
                sx: { height: 40 }
              }}
            />
          </Box>

          {/* Cuadrante */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 200px' }, 
            minWidth: { xs: '100%', sm: '200px' } 
          }}>
            <Controller
              name="cuadrante"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={cuadrantes || []}
                  getOptionLabel={(option) => {
                    if (typeof option === 'number') {
                      const cuadrante = cuadrantes.find(c => c.codCuadrante === option);
                      return cuadrante ? cuadrante.abreviatura : `Cuadrante ${option}`;
                    }
                    return option.abreviatura || `Cuadrante ${option.codCuadrante}`;
                  }}
                  value={cuadrantes?.find(c => c.codCuadrante === field.value) || null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?.codCuadrante || undefined);
                  }}
                  loading={loadingCuadrantes}
                  disabled={isFormDisabled || loadingCuadrantes}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cuadrante"
                      error={!!errors.cuadrante}
                      helperText={errors.cuadrante?.message}
                      size="small"
                      placeholder="Seleccione un cuadrante"
                      InputProps={{
                        ...params.InputProps,
                        sx: { height: 40 },
                        endAdornment: (
                          <>
                            {loadingCuadrantes ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <strong>{option.abreviatura}</strong>
                        {option.descripcion && (
                          <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                            - {option.descripcion}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                />
              )}
            />
          </Box>

          {/* Botones en la misma fila */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'row' },
            gap: 1,
            alignItems: 'center',
            flex: { xs: '1 1 100%', sm: '1 1 100%', md: '0 0 auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start', md: 'flex-start' }
          }}>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNew}
              disabled={loading}
              sx={{ 
                minWidth: 80,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Nuevo
            </Button>
            
            {onEditar && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={onEditar}
                disabled={loading || (isDirty && isValid)}
                sx={{ 
                  minWidth: 80,
                  height: 40,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Editar
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading || !isDirty || !isValid}
              sx={{ 
                minWidth: 100,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {loading
                ? isEditMode && sectorSeleccionado
                  ? "Actualizando..."
                  : "Guardando..."
                : isEditMode && sectorSeleccionado
                ? "Actualizar"
                : "Guardar"}
            </Button>
          </Box>
        </Box>

        {/* Alertas */}
        {modoOffline && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Modo sin conexión. Los cambios se sincronizarán cuando se restablezca la conexión.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default SectorForm;
