// src/components/contribuyentes/FiltroContribuyenteFormMUI.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Stack,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { FiltroContribuyente } from '../../models';

interface FiltroContribuyenteFormProps {
  onBuscar: (filtro: FiltroContribuyente) => void;
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
  const [busqueda, setBusqueda] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<any>(null);
  
  // Opciones para los selectores
  const tipoContribuyenteOptions = [
    { 
      id: 'natural', 
      label: 'Persona Natural',
      icon: <PersonIcon />,
      descripcion: 'Contribuyentes individuales'
    },
    { 
      id: 'juridica', 
      label: 'Persona Jurídica',
      icon: <BusinessIcon />,
      descripcion: 'Empresas y organizaciones'
    }
  ];

  const tipoDocumentoOptions = [
    { id: 'DNI', label: 'DNI', descripcion: 'Documento Nacional de Identidad' },
    { id: 'RUC', label: 'RUC', descripcion: 'Registro Único de Contribuyentes' },
    { id: 'CE', label: 'Carnet de Extranjería', descripcion: 'Para extranjeros residentes' },
    { id: 'PASAPORTE', label: 'Pasaporte', descripcion: 'Documento internacional' }
  ];

  // Manejar búsqueda
  const handleBuscar = () => {
    const filtro: FiltroContribuyente = {
      tipoContribuyente: tipoContribuyente?.id || '',
      busqueda: busqueda.trim(),
      tipoDocumento: tipoDocumento?.id
    };
    
    onBuscar(filtro);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setTipoContribuyente(null);
    setBusqueda('');
    setTipoDocumento(null);
    
    // Buscar con filtros vacíos (mostrar todos)
    onBuscar({
      tipoContribuyente: '',
      busqueda: ''
    });
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = tipoContribuyente || busqueda || tipoDocumento;

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: theme.palette.grey[50],
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Filtro de Contribuyentes
            </Typography>
            {hayFiltrosActivos && (
              <Chip
                size="small"
                label="Filtros activos"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          
          {onNuevo && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={onNuevo}
              size="small"
            >
              Nuevo Contribuyente
            </Button>
          )}
        </Stack>
      </Box>
      
      {/* Contenido del formulario */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Tipo de Contribuyente */}
          <Grid item xs={12} md={4}>
            <SearchableSelect
              id="tipo-contribuyente"
              label="Tipo de Contribuyente"
              options={tipoContribuyenteOptions}
              value={tipoContribuyente}
              onChange={setTipoContribuyente}
              placeholder="Seleccione tipo..."
              startIcon={tipoContribuyente?.icon || <PersonIcon />}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'action.active' }}>
                      {option.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.descripcion}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            />
          </Grid>

          {/* Tipo de Documento */}
          <Grid item xs={12} md={3}>
            <SearchableSelect
              id="tipo-documento"
              label="Tipo de Documento"
              options={tipoDocumentoOptions}
              value={tipoDocumento}
              onChange={setTipoDocumento}
              placeholder="Todos"
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.descripcion}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Grid>

          {/* Campo de búsqueda */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Buscar por"
              placeholder="Nombre, apellido, razón social o documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleBuscar();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: busqueda && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setBusqueda('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {hayFiltrosActivos && (
                <Button
                  variant="outlined"
                  onClick={handleLimpiar}
                  disabled={loading}
                  startIcon={<ClearIcon />}
                >
                  Limpiar Filtros
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={loading}
                startIcon={<FilterIcon />}
                sx={{
                  minWidth: 120,
                  background: theme.palette.primary.main,
                  '&:hover': {
                    background: theme.palette.primary.dark
                  }
                }}
              >
                Filtrar
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Información de ayuda */}
        {!hayFiltrosActivos && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Sugerencia:</strong> Puedes buscar por nombre completo, número de documento, 
              razón social o cualquier combinación. Los filtros te ayudan a refinar los resultados.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FiltroContribuyenteFormMUI;