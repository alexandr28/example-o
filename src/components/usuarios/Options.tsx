// src/components/usuarios/Options.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Paper,
  Typography,
  Alert
} from '@mui/material';
import {
  CheckCircle as ActivarIcon,
  Cancel as BajaIcon,
  Refresh as NuevoIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useUsuarios } from '../../hooks/useUsuarios';

type TipoOperacion = 'activar' | 'darBaja' | null;

interface OpcionOperacion {
  value: TipoOperacion;
  label: string;
}

const opcionesOperacion: OpcionOperacion[] = [
  { value: 'activar', label: 'Activar' },
  { value: 'darBaja', label: 'Dar de Baja' }
];

const Options: React.FC = () => {
  const location = useLocation();
  const [operacionSeleccionada, setOperacionSeleccionada] = useState<OpcionOperacion | null>(null);
  const [codigoUsuario, setCodigoUsuario] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { activarUsuario, darBajaUsuario, loading } = useUsuarios();

  // Pre-llenar codUsuario si viene del state de navegacion
  useEffect(() => {
    const state = location.state as { codUsuario?: number };
    if (state?.codUsuario) {
      setCodigoUsuario(state.codUsuario.toString());
    }
  }, [location.state]);

  // Manejar cambio de operacion
  const handleOperacionChange = (event: any, newValue: OpcionOperacion | null) => {
    setOperacionSeleccionada(newValue);
    setError('');
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    if (!operacionSeleccionada) {
      setError('Debe seleccionar una operacion');
      return false;
    }

    if (!codigoUsuario.trim()) {
      setError('El codigo de usuario es requerido');
      return false;
    }

    const codigo = parseInt(codigoUsuario);
    if (isNaN(codigo) || codigo <= 0) {
      setError('El codigo de usuario debe ser un numero valido mayor a 0');
      return false;
    }

    setError('');
    return true;
  };

  // Manejar envio del formulario
  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    const codigo = parseInt(codigoUsuario);

    try {
      if (operacionSeleccionada?.value === 'activar') {
        await activarUsuario(codigo);
      } else if (operacionSeleccionada?.value === 'darBaja') {
        await darBajaUsuario(codigo);
      }
    } catch (error) {
      console.error('Error al ejecutar operacion:', error);
    }
  };

  // Limpiar formulario
  const handleNuevo = () => {
    setOperacionSeleccionada(null);
    setCodigoUsuario('');
    setError('');
  };

  // Obtener texto del boton segun la operacion
  const getBotonTexto = (): string => {
    if (!operacionSeleccionada) return 'Seleccione Operacion';
    return operacionSeleccionada.label;
  };

  // Obtener icono del boton segun la operacion
  const getBotonIcono = () => {
    if (!operacionSeleccionada) return null;
    return operacionSeleccionada.value === 'activar' ? <ActivarIcon /> : <BajaIcon />;
  };

  // Obtener color del boton segun la operacion
  const getBotonColor = (): 'success' | 'error' | 'primary' => {
    if (!operacionSeleccionada) return 'primary';
    return operacionSeleccionada.value === 'activar' ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: '100%',
          mx: 'auto',
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(46, 125, 50, 0.03) 100%)',
          border: '1px solid rgba(76, 175, 80, 0.15)'
        }}
      >
        {/* Titulo */}
        <Box
          sx={{
            mb: 3,
            pb: 2,
            borderBottom: '2px solid',
            borderImage: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%) 1'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            Otras Opciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Activar o dar de baja usuarios del sistema
          </Typography>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Formulario - Todo en una sola fila */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          {/* Autocomplete - Tipo de Operacion */}
          <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
            <Autocomplete
              value={operacionSeleccionada}
              onChange={handleOperacionChange}
              options={opcionesOperacion}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo de Operacion"
                  placeholder="Seleccione una operacion"
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 36,
                    }
                  }}
                />
              )}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 56,
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                }
              }}
            />
          </Box>

          {/* TextField - Codigo Usuario */}
          <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
            <TextField
              fullWidth
              label="Codigo Usuario"
              value={codigoUsuario}
              onChange={(e) => {
                // Solo permite numeros
                const value = e.target.value.replace(/\D/g, '');
                setCodigoUsuario(value);
                setError('');
              }}
              disabled={loading}
              placeholder="Ingrese el codigo del usuario"
              required
              inputProps={{
                pattern: '[0-9]*',
                inputMode: 'numeric'
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                }
              }}
            />
          </Box>

          {/* Boton Nuevo */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<NuevoIcon />}
            onClick={handleNuevo}
            disabled={loading}
            sx={{
              minWidth: 120,
              height: 36,
              borderWidth: 2,
              fontWeight: 600,
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
              }
            }}
          >
            Nuevo
          </Button>

          {/* Boton Activar/Dar de Baja - Dinamico */}
          <Button
            variant="contained"
            color={getBotonColor()}
            startIcon={getBotonIcono()}
            onClick={handleSubmit}
            disabled={loading || !operacionSeleccionada || !codigoUsuario}
            sx={{
              minWidth: 180,
              height: 36,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: operacionSeleccionada
                ? '0 4px 12px rgba(76, 175, 80, 0.35)'
                : 'none',
              '&:hover': {
                boxShadow: operacionSeleccionada
                  ? '0 6px 16px rgba(76, 175, 80, 0.45)'
                  : 'none',
              }
            }}
          >
            {loading ? 'Procesando...' : getBotonTexto()}
          </Button>
        </Box>

        {/* Informacion adicional */}
        {operacionSeleccionada && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background:
                operacionSeleccionada.value === 'activar'
                  ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(46, 125, 50, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(211, 47, 47, 0.08) 100%)',
              border: `1px solid ${
                operacionSeleccionada.value === 'activar'
                  ? 'rgba(76, 175, 80, 0.3)'
                  : 'rgba(244, 67, 54, 0.3)'
              }`
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {operacionSeleccionada.value === 'activar' ? (
                <>
                  <strong>Activar Usuario:</strong> El usuario podra acceder al sistema
                  nuevamente y realizar todas las operaciones permitidas.
                </>
              ) : (
                <>
                  <strong>Dar de Baja Usuario:</strong> El usuario sera desactivado y no
                  podra acceder al sistema hasta que sea activado nuevamente.
                </>
              )}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Options;
