// src/components/contribuyentes/FiltroContribuyenteFormMUI.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
  Chip,
  useTheme,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';

interface FiltroContribuyenteFormProps {
  onBuscar: (filtro: any) => void;
  onNuevo?: () => void;
  loading?: boolean;
}

const FiltroContribuyenteFormMUI: React.FC<FiltroContribuyenteFormProps> = ({
  onBuscar,
  onNuevo,
  loading = false
}) => {
  const theme = useTheme();
  
  // Estados del formulario
  const [tipoContribuyente, setTipoContribuyente] = useState<any>(null);
  const [tipoDocumento, setTipoDocumento] = useState<any>(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Opciones para los selectores
  const tipoContribuyenteOptions = [
    { 
      id: 'natural', 
      label: 'Natural',
      icon: <PersonIcon sx={{ fontSize: 16 }} />
    },
    { 
      id: 'juridica', 
      label: 'Jurídica',
      icon: <BusinessIcon sx={{ fontSize: 16 }} />
    }
  ];

  const tipoDocumentoOptions = [
    { id: 'todos', label: 'Todos' },
    { id: 'DNI', label: 'DNI' },
    { id: 'RUC', label: 'RUC' },
    { id: 'CE', label: 'CE' },
    { id: 'PASAPORTE', label: 'Pasaporte' }
  ];

  // Manejar búsqueda
  const handleBuscar = () => {
    onBuscar({
      tipoContribuyente: tipoContribuyente?.id || '',
      tipoDocumento: tipoDocumento?.id || '',
      busqueda: busqueda.trim()
    });
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setTipoContribuyente(null);
    setTipoDocumento(null);
    setBusqueda('');
    onBuscar({ tipoContribuyente: '', tipoDocumento: '', busqueda: '' });
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = tipoContribuyente || tipoDocumento || busqueda;

  return (
    <Box sx={{ maxWidth: '900px' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            Filtro de Contribuyentes
          </Typography>
          {hayFiltrosActivos && (
            <Chip
              size="small"
              label="Filtros activos"
              color="primary"
              variant="outlined"
              onDelete={handleLimpiar}
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Filtros en una sola línea */}
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '0 0 140px' }}>
              <SearchableSelect
                id="tipo-contribuyente"
                label="Tipo de Contr..."
                options={tipoContribuyenteOptions}
                value={tipoContribuyente}
                onChange={setTipoContribuyente}
                placeholder="Seleccione"
                textFieldProps={{ 
                  size: 'small',
                  sx: { 
                    '& .MuiInputBase-root': { 
                      fontSize: '0.875rem',
                      backgroundColor: theme.palette.background.paper 
                    }
                  }
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </Box>
                )}
              />
            </Box>

            <Box sx={{ flex: '0 0 120px' }}>
              <SearchableSelect
                id="tipo-documento"
                label="Tipo de..."
                options={tipoDocumentoOptions}
                value={tipoDocumento}
                onChange={setTipoDocumento}
                placeholder="Todos"
                textFieldProps={{ 
                  size: 'small',
                  sx: { 
                    '& .MuiInputBase-root': { 
                      fontSize: '0.875rem',
                      backgroundColor: theme.palette.background.paper 
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <TextField
                fullWidth
                size="small"
                label="Buscar por"
                placeholder="Nombre, apellido, razón social..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleBuscar();
                  }
                }}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: '0.875rem',
                    backgroundColor: theme.palette.background.paper 
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: busqueda && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setBusqueda('')}
                        edge="end"
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ flex: '0 0 auto' }}>
              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={loading}
                startIcon={<FilterIcon sx={{ fontSize: 16 }} />}
                sx={{ 
                  height: '40px',
                  textTransform: 'none',
                  backgroundColor: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark,
                  },
                  fontSize: '0.875rem',
                  px: 3
                }}
              >
                Filtrar
              </Button>
            </Box>
          </Box>

          {/* Sugerencia */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
            <Typography variant="caption" color="text.secondary">
              <strong>Sugerencia:</strong> Puedes buscar por nombre completo, número de documento, razón social o cualquier combinación. Los filtros te ayudan a refinar los resultados.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FiltroContribuyenteFormMUI;