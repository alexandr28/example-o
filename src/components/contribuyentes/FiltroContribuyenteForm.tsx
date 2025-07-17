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
import  constanteService, {ConstanteData } from '../../services/constanteService';
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
                options={tipoContribuyenteOptions}
                value={tipoContribuyente}
                onChange={(newValue) => {
                  console.log('Tipo contribuyente seleccionado:', newValue);
                  setTipoContribuyente(newValue);
                }}
                placeholder="Tipo Contribuyente"
                disabled={loadingOptions}
              />
            </Box>

            <Box sx={{ flex: '0 0 150px' }}>
              <SearchableSelect
                id="tipo-documento"
                options={tipoDocumentoOptions}
                value={tipoDocumento}
                onChange={(newValue) => {
                  console.log('Tipo documento seleccionado:', newValue);
                  setTipoDocumento(newValue);
                }}
                placeholder="Tipo Documento"
                disabled={loadingOptions}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    fontSize: '0.875rem',
                    backgroundColor: theme.palette.background.paper 
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Buscar contribuyentes">
                <Button
                  variant="contained"
                  onClick={handleBuscar}
                  disabled={loading || loadingOptions}
                  startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                  sx={{ 
                    height: '40px',
                    minWidth: '100px',
                    fontSize: '0.875rem'
                  }}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </Tooltip>

              {onNuevo && (
                <Tooltip title="Nuevo contribuyente">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={onNuevo}
                    disabled={loading}
                    startIcon={<PersonAddIcon />}
                    sx={{ 
                      height: '40px',
                      fontSize: '0.875rem'
                    }}
                  >
                    Nuevo Contribuyente
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Información adicional */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <InfoIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography variant="caption" color="text.secondary">
              Puede buscar por nombre completo, número de documento o dirección
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FiltroContribuyenteFormMUI;