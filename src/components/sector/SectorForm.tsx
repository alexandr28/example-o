// src/components/sector/SectorForm.tsx - Versión Material-UI
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  CloudOff as CloudOffIcon,
  Edit as EditIcon,
  Business as BusinessIcon
} from "@mui/icons-material";
import { Sector } from "../../models/Sector";

// Schema de validación
const sectorSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del sector es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),
  // .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')e
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface SectorFormProps {
  sectorSeleccionado?: Sector | null;
  onGuardar: (data: { nombre: string }) => void | Promise<void>;
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
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue,
    watch,
  } = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: { nombre: "" },
    mode: "onChange",
  });

  // Observar el valor del nombre
  const nombreValue = watch("nombre");

  // Estado para debug
  // const [showDebug] = React.useState(false);

  // Actualizar formulario cuando cambia el sector seleccionado
  useEffect(() => {
    if (sectorSeleccionado) {
      setValue("nombre", sectorSeleccionado.nombre || "");
    } else {
      reset({ nombre: "" });
    }
  }, [sectorSeleccionado, setValue, reset]);

  const onSubmit = async (data: SectorFormData) => {
    try {
      await onGuardar(data);
      if (!isEditMode) {
        reset({ nombre: "" });
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleNew = () => {
    reset({ nombre: "" });
    onNuevo();
  };

  const isFormDisabled = loading || (sectorSeleccionado && !isEditMode);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider',
        width: '100%'
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BusinessIcon />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Formulario de Sector
          </Typography>
          
          {/* Chips informativos */}
          <Box sx={{ flex: 1 }} />
          {modoOffline && (
            <Chip
              icon={<CloudOffIcon />}
              label="Sin conexión"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {sectorSeleccionado && (
            <Chip
              label={`ID: ${sectorSeleccionado.id}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>

        {/* Fila única con todos los campos del formulario */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3,
          alignItems: 'center'
        }}>
          {/* Nombre del Sector */}
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
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

          {/* Botones en la misma fila */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center',
            flex: '0 0 auto'
          }}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleNew}
              disabled={loading}
              sx={{ 
                minWidth: 80,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
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
                disabled={loading}
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
          <Alert severity="warning" sx={{ mt: 2 }}>
            Modo sin conexión. Los cambios se sincronizarán cuando se restablezca la conexión.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default SectorForm;
