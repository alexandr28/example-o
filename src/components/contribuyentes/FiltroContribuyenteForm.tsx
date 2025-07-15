// src/components/contribuyentes/FiltroContribuyenteForm.tsx
import React, { useState, useEffect } from 'react';
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
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Info as InfoIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { constanteService, ConstanteData } from '../../services/constanteService';
import { NotificationService } from '../utils/Notification';

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
  
  // Estados para las opciones cargadas desde la API
  const [tipoContribuyenteOptions, setTipoContribuyenteOptions] = useState<any[]>([]);
  const [tipoDocumentoOptions, setTipoDocumentoOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Cargar opciones desde la API al montar el componente
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setLoadingOptions(true);
        
        // Cargar tipos de contribuyente en paralelo
        const [tiposContribuyente, tiposDocumento] = await Promise.all([
          constanteService.obtenerTiposContribuyente(),
          constanteService.obtenerTiposDocumento()
        ]);
        
        // Formatear opciones de tipo contribuyente
        const opcionesContribuyente = tiposContribuyente.map((tipo: ConstanteData) => ({
          id: tipo.codConstante,
          label: tipo.nombreCategoria,
          icon: tipo.nombreCategoria.includes('NATURAL') ? 
            <PersonIcon sx={{ fontSize: 16 }} /> : 
            tipo.nombreCategoria.includes('JURIDIC') ?
            <BusinessIcon sx={{ fontSize: 16 }} /> :
            <AccountBalanceIcon sx={{ fontSize: 16 }} />
        }));
        
        // Formatear opciones de tipo documento
        const opcionesDocumento = tiposDocumento.map((tipo: ConstanteData) => ({
          id: tipo.codConstante,
          label: tipo.nombreCategoria
        }));
        
        // NO agregar opción "Todos" - usar solo los datos de la API
        
        setTipoContribuyenteOptions(opcionesContribuyente);
        setTipoDocumentoOptions(opcionesDocumento);
        
        console.log('✅ Opciones cargadas:', {
          tiposContribuyente: opcionesContribuyente,
          tiposDocumento: opcionesDocumento
        });
        
      } catch (error) {
        console.error('❌ Error cargando opciones:', error);
        NotificationService.error('Error al cargar las opciones de búsqueda');
        
        // Establecer opciones por defecto en caso de error
        setTipoContribuyenteOptions([
          { id: '0301', label: 'Natural', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
          { id: '0302', label: 'Jurídica', icon: <BusinessIcon sx={{ fontSize: 16 }} /> }
        ]);
        
        setTipoDocumentoOptions([
          { id: 'todos', label: 'Todos' },
          { id: '4101', label: 'DNI' },
          { id: '4102', label: 'RUC' }
        ]);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    cargarOpciones();
  }, []);

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
            <Box sx={{ flex: '0 0 180px' }}>
              <SearchableSelect
                id="tipo-contribuyente"
                label="Tipo de Contribuyente"
                options={tipoContribuyenteOptions}
                value={tipoContribuyente}
                onChange={(newValue) => {
                  console.log('Tipo contribuyente seleccionado:', newValue);
                  setTipoContribuyente(newValue);
                }}
                placeholder="Seleccione"
                disabled={loadingOptions}
                textFieldProps={{ 
                  size: 'small',
                  sx: { 
                    '& .MuiInputBase-root': { 
                      fontSize: '0.875rem',
                      backgroundColor: theme.palette.background.paper 
                    }
                  }
                }}
                getOptionLabel={(option) => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
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

            <Box sx={{ flex: '0 0 150px' }}>
              <SearchableSelect
                id="tipo-documento"
                label="Tipo de Documento"
                options={tipoDocumentoOptions}
                value={tipoDocumento}
                onChange={(newValue) => {
                  console.log('Tipo documento seleccionado:', newValue);
                  setTipoDocumento(newValue);
                }}
                placeholder="Seleccione tipo"
                disabled={loadingOptions}
                textFieldProps={{ 
                  size: 'small',
                  sx: { 
                    '& .MuiInputBase-root': { 
                      fontSize: '0.875rem',
                      backgroundColor: theme.palette.background.paper 
                    }
                  }
                }}
                getOptionLabel={(option) => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </Box>

            <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <TextField
                fullWidth
                size="small"
                label="Buscar contribuyente"
                placeholder="Nombre, documento, dirección..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading && !loadingOptions) {
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
                      <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
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
          </Box>

          {/* Botones de acción */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            justifyContent: 'flex-end',
            pt: 0.5
          }}>
            {onNuevo && (
              <Button
                variant="outlined"
                size="small"
                onClick={onNuevo}
                startIcon={<PersonAddIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  fontSize: '0.813rem',
                  textTransform: 'none',
                  px: 2
                }}
              >
                Nuevo Contribuyente
              </Button>
            )}
            
            <Button
              variant="contained"
              size="small"
              onClick={handleBuscar}
              disabled={loading || loadingOptions}
              startIcon={loading ? 
                <CircularProgress size={16} color="inherit" /> : 
                <SearchIcon sx={{ fontSize: 18 }} />
              }
              sx={{ 
                fontSize: '0.813rem',
                textTransform: 'none',
                px: 2,
                minWidth: 100
              }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
        </Stack>

        {/* Indicador de carga de opciones */}
        {loadingOptions && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 2 
          }}>
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: theme.palette.primary.main,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 }
              }
            }} />
          </Box>
        )}
      </Paper>

      {/* Información adicional */}
      <Box sx={{ 
        mt: 1, 
        display: 'flex', 
        alignItems: 'center',
        px: 1 
      }}>
        <InfoIcon sx={{ fontSize: 14, color: theme.palette.text.secondary, mr: 0.5 }} />
        <Typography variant="caption" color="text.secondary">
          Puede buscar por nombre completo, número de documento o dirección
        </Typography>
      </Box>
    </Box>
  );
};

export default FiltroContribuyenteFormMUI;