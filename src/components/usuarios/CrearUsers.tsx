// src/components/usuarios/CrearUsers.tsx
import React from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';
import { useUsuarios } from '../../hooks/useUsuarios';
import { USER_ROLES, USER_ESTADOS } from '../../config/constants';

// Esquema de validacion con Zod
const crearUserSchema = z.object({
  username: z.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, numeros y guion bajo'),
  nombrePersona: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  documento: z.string()
    .length(8, 'El DNI debe tener exactamente 8 digitos')
    .regex(/^\d{8}$/, 'El DNI solo debe contener numeros'),
  codEstado: z.string()
    .min(1, 'Debe seleccionar un estado'),
  password: z.string()
    .min(6, 'La contrasena debe tener al menos 6 caracteres')
    .max(50, 'La contrasena no puede exceder 50 caracteres'),
  codRol: z.number()
    .min(1, 'Debe seleccionar un rol'),
});

type CrearUserFormData = z.infer<typeof crearUserSchema>;

// Opciones para el Autocomplete de Estado
const estadoOptions = [
  { label: 'Activo', value: USER_ESTADOS.ACTIVO },
  { label: 'Inactivo', value: USER_ESTADOS.INACTIVO },
  { label: 'Suspendido', value: USER_ESTADOS.SUSPENDIDO },
];

// Opciones para el Autocomplete de Rol
const rolOptions = [
  { label: 'Administrador', value: 1 },
  { label: 'Cajero', value: 2 },
  { label: 'Gerente', value: 3 },
  { label: 'Supervisor', value: 4 },
  { label: 'Usuario', value: 5 },
];

const CrearUsers: React.FC = () => {
  const { crearUsuario, loading } = useUsuarios();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CrearUserFormData>({
    resolver: zodResolver(crearUserSchema),
    defaultValues: {
      username: '',
      nombrePersona: '',
      documento: '',
      codEstado: USER_ESTADOS.ACTIVO,
      password: '',
      codRol: 1,
    }
  });

  // Handler para guardar
  const onSubmit = async (data: CrearUserFormData) => {
    try {
      console.log('[CrearUsers] Enviando datos:', data);

      await crearUsuario({
        username: data.username,
        nombrePersona: data.nombrePersona,
        documento: data.documento,
        codEstado: data.codEstado,
        password: data.password,
        codRol: data.codRol
      });

      // Limpiar formulario despues de crear exitosamente
      reset();

    } catch (error: any) {
      console.error('[CrearUsers] Error:', error);
    }
  };

  // Handler para nuevo (limpiar formulario)
  const handleNuevo = () => {
    reset({
      username: '',
      nombrePersona: '',
      documento: '',
      codEstado: USER_ESTADOS.ACTIVO,
      password: '',
      codRol: 1,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Registro de Usuario
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Primera fila */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Usuario"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={loading}
                  placeholder="Ingrese nombre de usuario"
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="nombrePersona"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre Persona"
                  fullWidth
                  error={!!errors.nombrePersona}
                  helperText={errors.nombrePersona?.message}
                  disabled={loading}
                  placeholder="Ingrese nombre completo"
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="documento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="DNI"
                  fullWidth
                  error={!!errors.documento}
                  helperText={errors.documento?.message}
                  disabled={loading}
                  placeholder="8 digitos"
                  inputProps={{
                    maxLength: 8,
                    pattern: '[0-9]*',
                  }}
                  onChange={(e) => {
                    // Solo permitir numeros
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                />
              )}
            />
          </Box>

          {/* Segunda fila */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="codEstado"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={estadoOptions}
                  getOptionLabel={(option) => option.label}
                  value={estadoOptions.find(opt => opt.value === value) || null}
                  onChange={(_, newValue) => {
                    onChange(newValue?.value || '');
                  }}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Estado"
                      error={!!errors.codEstado}
                      helperText={errors.codEstado?.message}
                    />
                  )}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contrasena"
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  placeholder="Minimo 6 caracteres"
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="codRol"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={rolOptions}
                  getOptionLabel={(option) => option.label}
                  value={rolOptions.find(opt => opt.value === value) || null}
                  onChange={(_, newValue) => {
                    onChange(newValue?.value || 1);
                  }}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rol"
                      error={!!errors.codRol}
                      helperText={errors.codRol?.message}
                    />
                  )}
                />
              )}
            />
          </Box>

          {/* Tercera fila - Botones en el lado derecho */}
          <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNuevo}
              disabled={loading}
              sx={{
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#2e7d32',
                  backgroundColor: 'rgba(76, 175, 80, 0.08)',
                }
              }}
            >
              Nuevo
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                }
              }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CrearUsers;
