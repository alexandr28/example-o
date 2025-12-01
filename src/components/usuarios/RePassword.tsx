// src/components/usuarios/RePassword.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';
import { useUsuarios } from '../../hooks/useUsuarios';

// Esquema de validacion con Zod
const changePasswordSchema = z.object({
  codUsuario: z.string()
    .min(1, 'El codigo de usuario es requerido')
    .regex(/^\d+$/, 'El codigo de usuario debe ser un numero'),
  newPassword: z.string()
    .min(6, 'La nueva contrasena debe tener al menos 6 caracteres')
    .max(50, 'La contrasena no puede exceder 50 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Debe confirmar la nueva contrasena'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const RePassword: React.FC = () => {
  const location = useLocation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { cambiarClave, loading } = useUsuarios();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      codUsuario: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Pre-llenar codUsuario si viene del state de navegacion
  useEffect(() => {
    const state = location.state as { codUsuario?: number };
    if (state?.codUsuario) {
      setValue('codUsuario', state.codUsuario.toString());
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      console.log('[RePassword] Cambiando contrasena para usuario:', data.codUsuario);

      const codUsuario = parseInt(data.codUsuario);
      await cambiarClave({ codUsuario, password: data.newPassword });

      // Limpiar formulario despues de cambiar exitosamente
      reset();

    } catch (error: any) {
      console.error('[RePassword] Error:', error);
    }
  };

  const handleClear = () => {
    reset();
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
        Cambiar Contrasena
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Primera fila - Codigo Usuario */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="codUsuario"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Codigo Usuario"
                  fullWidth
                  error={!!errors.codUsuario}
                  helperText={errors.codUsuario?.message}
                  disabled={loading}
                  placeholder="Ingrese codigo de usuario"
                  inputProps={{
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
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

          {/* Segunda fila - Nuevas contrasenas */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nueva Contrasena"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  disabled={loading}
                  placeholder="Minimo 6 caracteres"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 11px)' } }}>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirmar Nueva Contrasena"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={loading}
                  placeholder="Repita la nueva contrasena"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* Tercera fila - Botones */}
          <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
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
              Limpiar
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

export default RePassword;
