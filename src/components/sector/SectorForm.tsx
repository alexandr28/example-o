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
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  CloudOff as CloudOffIcon,
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
  onEditar: () => void;
  modoOffline?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sectorSeleccionado,
  onGuardar,
  onNuevo,
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
      elevation={0}
      sx={{
        overflow: "hidden",
        border: "none",
        maxWidth: 600,
        mx: "auto",
        boxShadow:
          "0 8px 32px 0 rgba(60,60,120,0.10), 0 1.5px 8px 0 rgba(60,60,120,0.07)", // Sombra bifuminada y suave
        backdropFilter: "blur(0.1px)", //
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "transparent",
          borderBottom: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, fontSize: "1rem", color: "#374151" }}
        >
          Datos del Sector
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {modoOffline && (
            <Chip
              icon={<CloudOffIcon sx={{ fontSize: "0.875rem" }} />}
              label="Sin conexión"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 24 }}
            />
          )}

          {sectorSeleccionado && (
            <Chip
              label={`ID: ${sectorSeleccionado.id}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 24 }}
            />
          )}
        </Stack>
      </Box>

      {/* Formulario */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 10, pb: 5 }}
      >
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Campo Nombre */}
          <TextField
            {...register("nombre")}
            label="Nombre del Sector"
            placeholder="Ingrese el nombre del sector"
            fullWidth
            size="small"
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
            disabled={!!isFormDisabled}
            required
            InputProps={{
              endAdornment: nombreValue && !isFormDisabled && (
                <Tooltip title="Limpiar">
                  <IconButton
                    size="small"
                    onClick={() => setValue("nombre", "")}
                    edge="end"
                    sx={{ mr: -1 }}
                  >
                    <ClearIcon sx={{ fontSize: "0.9rem" }} />
                  </IconButton>
                </Tooltip>
              ),
              sx: { fontSize: "0.80rem", height: 36 },
            }}
            InputLabelProps={{
              sx: { fontSize: "0.80rem" },
              shrink: true,
            }}
            sx={{
              "& .MuiInputBase-root": {
                height: 36,
                fontSize: "0.80rem",
              },
              "& .MuiInputBase-input": {
                padding: "6px 10px",
                fontSize: "0.80rem",
              },
              "& .MuiFormHelperText-root": {
                fontSize: "0.70rem",
                marginLeft: 1,
                marginRight: 1,
                marginTop: 0.5,
              },
              "& .MuiInputBase-input.Mui-disabled": {
                color: "text.primary",
                WebkitTextFillColor: "text.primary",
              },
            }}
          />

          {/* Información adicional */}
          {sectorSeleccionado && !isEditMode && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 5, fontSize: "0.75rem" }}
            ></Typography>
          )}
        </Stack>

        {/* Botones de acción */}
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          {!sectorSeleccionado || isEditMode ? (
            <>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={14} />
                  ) : (
                    <SaveIcon sx={{ fontSize: "0.9rem" }} />
                  )
                }
                disabled={loading || !isDirty || !isValid}
                size="small"
                sx={{
                  minWidth: 90,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.80rem",
                  py: 0.5,
                  bgcolor: "#6B7280",
                  "&:hover": {
                    bgcolor: "#4B5563",
                  },
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

              {/* Boton Cancelar */}
              <Button
                variant="outlined"
                startIcon={<ClearIcon sx={{ fontSize: "0.9rem" }} />}
                onClick={handleNew}
                disabled={loading}
                size="small"
                sx={{
                  minWidth: 90,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.80rem",
                  py: 0.5,
                  color: "#10B981",
                  borderColor: "#10B981",
                  "&:hover": {
                    borderColor: "#059669",
                    bgcolor: "rgba(16, 185, 129, 0.04)",
                  },
                }}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: "0.9rem" }} />}
                onClick={handleNew}
                disabled={loading}
                size="small"
                sx={{
                  minWidth: 90,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.80rem",
                  py: 0.5,
                  bgcolor: "#10B981",
                  "&:hover": {
                    bgcolor: "#059669",
                  },
                }}
              >
                Nuevo
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SectorForm;
