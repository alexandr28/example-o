// src/components/predio/pisos/ConsultaPisos.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Chip,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  InputAdornment,
  Divider,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Domain as DomainIcon,
  LocationOn as LocationIcon,
  Layers as LayersIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { usePisos } from '../../../hooks/usePisos';
import SelectorPredios from './SelectorPredios';
import { PisoData } from '../../../services/pisoService';
import { Predio } from '../../../models/Predio';
import { NotificationService } from '../../utils/Notification';
import { useNavigate, useLocation } from 'react-router-dom';

// Interfaces
interface Piso {
  id: number;
  item: number;
  descripcion: string;
  valorUnitario: number;
  incremento: number;
  porcentajeDepreciacion: number;
  valorUnicoDepreciado: number;
  valorAreaConstruida: number;
  areaConstruida: number;
  areaTotalConstruccion: number;
}

// Usar la interfaz del modelo importado

const ConsultaPisos: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { consultarPisos, loading } = usePisos();

  // Estados
  const [predio, setPredio] = useState<Predio | null>(null);
  const [pisos, setPisos] = useState<Piso[]>([]);
  const [pisosData, setPisosData] = useState<PisoData[]>([]);
  const [filtros, setFiltros] = useState({
    codPiso: '',
    anio: new Date().getFullYear(),
    codPredio: '',
    numeroPiso: ''
  });
  const [showSelectorPredios, setShowSelectorPredios] = useState(false);
  const [autoSearchTriggered, setAutoSearchTriggered] = useState(false);
  
  // Debug: Logging cuando cambia el estado de pisos
  React.useEffect(() => {
    console.log('🔍 [ConsultaPisos] Estado de pisos cambió:', pisos);
    console.log('🔍 [ConsultaPisos] Cantidad de pisos en estado:', pisos.length);
    console.log('🔍 [ConsultaPisos] Loading:', loading);
  }, [pisos, loading]);

  // Efecto para recibir predio desde navegación y buscar automáticamente
  React.useEffect(() => {
    const state = location.state as { codigoPredio?: string; predio?: Predio; codPredioBase?: string };

    if (state && state.codigoPredio && !autoSearchTriggered) {
      console.log('🔍 [ConsultaPisos] Recibido predio desde navegación:', state);
      console.log('🔍 [ConsultaPisos] Usando código base:', state.codPredioBase || state.codigoPredio);

      // Establecer el predio
      if (state.predio) {
        setPredio(state.predio);
      }

      // Pre-llenar filtros con el código base del predio (prioridad) o código completo
      setFiltros(prev => ({
        ...prev,
        codPredio: state.codPredioBase || state.codigoPredio || ''
      }));

      // Marcar que ya se realizó la búsqueda automática
      setAutoSearchTriggered(true);

      // Buscar pisos automáticamente después de un pequeño delay
      setTimeout(() => {
        handleBuscar();
      }, 100);
    }
  }, [location.state, autoSearchTriggered]);

  // Buscar pisos con filtros
  const handleBuscar = async () => {
    console.log('🔍 [ConsultaPisos] handleBuscar iniciado con filtros:', filtros);
    
    try {
      // Función para limpiar parámetros
      const limpiarParametro = (valor: any): string => {
        return String(valor).trim().replace(/\s+/g, '');
      };
      
      // El API requiere TODOS los parámetros - permitir vacíos para búsqueda amplia
      const parametros = {
        anio: filtros.anio || new Date().getFullYear(),
        codPiso: filtros.codPiso ? parseInt(limpiarParametro(filtros.codPiso)) : undefined,
        codPredio: filtros.codPredio ? limpiarParametro(filtros.codPredio) : (predio?.codPredio || predio?.codigoPredio || ''),
        numeroPiso: filtros.numeroPiso ? parseInt(limpiarParametro(filtros.numeroPiso)) : undefined
      };
      
      console.log('📡 [ConsultaPisos] Parámetros enviados al API:', parametros);
      
      const pisosEncontrados = await consultarPisos(parametros);
      
      console.log('✅ [ConsultaPisos] Pisos encontrados:', pisosEncontrados.length);
      console.log('📋 [ConsultaPisos] Datos recibidos:', pisosEncontrados);

      // Convertir a formato de tabla - usar ?? para manejar null correctamente
      const pisosFormateados: Piso[] = pisosEncontrados.map((piso, index) => ({
        id: piso.id ?? piso.codPiso ?? index + 1,
        item: index + 1,
        descripcion: piso.numeroPisoDesc || `Piso ${piso.numeroPiso ?? index + 1}`,
        valorUnitario: piso.valorUnitario ?? 0,
        incremento: piso.incremento ?? 0,
        porcentajeDepreciacion: piso.depreciacion ?? 0,
        valorUnicoDepreciado: piso.valorUnitarioDepreciado ?? 0,
        valorAreaConstruida: piso.valorAreaConstruida ?? 0,
        areaConstruida: piso.areaConstruida ?? 0,
        areaTotalConstruccion: piso.areaTotalConstruccion ?? 0
      }));

      console.log('📊 [ConsultaPisos] Pisos formateados para tabla:', pisosFormateados);

      setPisos(pisosFormateados);
      setPisosData(pisosEncontrados);
      
    } catch (error: any) {
      console.error('❌ [ConsultaPisos] Error al consultar pisos:', error);
      
      // Mostrar datos de ejemplo en caso de error 403 o problemas de servidor
      console.log('🔄 [ConsultaPisos] Usando datos de ejemplo debido al error del servidor');
      
      const pisosEjemplo: Piso[] = [
        {
          id: 1,
          item: 1,
          descripcion: 'Primer piso',
          valorUnitario: 347.18,
          incremento: 0,
          porcentajeDepreciacion: 0.6,
          valorUnicoDepreciado: 208.31,
          valorAreaConstruida: 15500.75,
          areaConstruida: 19.8,
          areaTotalConstruccion: 89.8
        },
        {
          id: 2,
          item: 2,
          descripcion: 'Segundo piso',
          valorUnitario: 347.18,
          incremento: 0,
          porcentajeDepreciacion: 0.6,
          valorUnicoDepreciado: 208.31,
          valorAreaConstruida: 18200.50,
          areaConstruida: 25.5,
          areaTotalConstruccion: 89.8
        },
        {
          id: 3,
          item: 3,
          descripcion: 'Tercer piso',
          valorUnitario: 385.25,
          incremento: 0.05,
          porcentajeDepreciacion: 0.55,
          valorUnicoDepreciado: 173.36,
          valorAreaConstruida: 22100.00,
          areaConstruida: 44.5,
          areaTotalConstruccion: 89.8
        }
      ];
      
      // Crear datos de ejemplo completos para pisosData
      const pisosDataEjemplo: PisoData[] = pisosEjemplo.map((piso, index) => ({
        id: piso.id,
        codPiso: piso.id,
        anio: filtros.anio,
        codigoPredio: filtros.codPredio || '20231',
        codPredio: filtros.codPredio || '20231',
        numeroPiso: index + 1,
        fechaConstruccion: 631170000000,
        fechaConstruccionStr: '1990-01-01',
        valorUnitario: piso.valorUnitario,
        areaConstruida: Math.round(piso.valorAreaConstruida / piso.valorUnicoDepreciado),
        incremento: piso.incremento,
        depreciacion: piso.porcentajeDepreciacion,
        valorUnitarioDepreciado: piso.valorUnicoDepreciado,
        valorAreaConstruida: piso.valorAreaConstruida,
        codLetraMurosColumnas: '1101',
        murosColumnas: '100101',
        codLetraTechos: '1101',
        techos: '100102',
        codLetraPisos: '1101',
        pisos: '100201',
        codLetraPuertasVentanas: '1101',
        puertasVentanas: '100202',
        codLetraRevestimiento: '1101',
        revestimiento: '100203',
        codLetraBanios: '1101',
        banios: '100204',
        codLetraInstalacionesElectricas: '1101',
        instalacionesElectricas: '100301',
        codEstadoConservacion: '9402',
        codMaterialEstructural: '0703',
        estado: 'ACTIVO'
      }));
      
      setPisos(pisosEjemplo);
      setPisosData(pisosDataEjemplo);
      
      // Mostrar mensaje informativo al usuario
      console.log(`ℹ️ [ConsultaPisos] Mostrando ${pisosEjemplo.length} pisos de ejemplo (Error del servidor: ${error.message})`);
      
      // Notificar al usuario sobre el error pero mostrar datos de ejemplo
      NotificationService.warning(
        `Error del servidor (${error.message?.split('.')[0]}). Mostrando datos de ejemplo para desarrollo.`
      );
    }
  };
  

  // Seleccionar predio
  const handleSelectPredio = (predioSeleccionado: Predio) => {
    console.log('🏠 [ConsultaPisos] Predio seleccionado:', predioSeleccionado);
    
    // Limpiar y validar el código del predio
    let codigoPredio = predioSeleccionado.codPredio || predioSeleccionado.codigoPredio || '';
    codigoPredio = String(codigoPredio).trim().replace(/\s+/g, '');
    
    console.log('📋 [ConsultaPisos] Código de predio limpio:', `'${codigoPredio}'`);
    
    setPredio(predioSeleccionado);
    // Actualizar filtros con el código del predio seleccionado
    setFiltros(prev => ({
      ...prev,
      codPredio: codigoPredio
    }));
    setPisos([]);
    setPisosData([]);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setFiltros({
      codPiso: '',
      anio: new Date().getFullYear(),
      codPredio: '',
      numeroPiso: ''
    });
    setPisos([]);
    setPisosData([]);
    setPredio(null);
  };

  // Editar piso
  const handleEdit = (piso: Piso) => {
    console.log('✏️ [ConsultaPisos] Editando piso:', piso);
    console.log('📊 [ConsultaPisos] pisosData disponibles:', pisosData);

    // Obtener el índice del piso en la tabla (item es index + 1)
    const indexEnTabla = piso.item - 1;

    // Obtener los datos completos del piso desde pisosData usando el mismo índice
    // ya que pisosFormateados y pisosData se crean en el mismo orden
    let pisoCompleto: PisoData | undefined = pisosData[indexEnTabla];

    // Si no se encuentra por índice, intentar búsqueda por id/codPiso
    if (!pisoCompleto) {
      pisoCompleto = pisosData.find(p =>
        (p.id === piso.id) ||
        (p.codPiso === piso.id) ||
        (Number(p.codPiso) === Number(piso.id))
      );
    }

    console.log('📊 [ConsultaPisos] Datos completos del piso encontrado:', pisoCompleto);
    
    if (pisoCompleto && predio) {
      // Preparar datos para enviar al formulario de registro/edición
      const datosEdicion = {
        // Datos del piso
        piso: {
          id: pisoCompleto.id,
          codPiso: pisoCompleto.codPiso,
          numeroPiso: pisoCompleto.numeroPiso,
          anio: pisoCompleto.anio,
          fechaConstruccion: pisoCompleto.fechaConstruccionStr || '1990-01-01',
          areaConstruida: pisoCompleto.areaConstruida || 0,
          valorUnitario: pisoCompleto.valorUnitario || 0,
          incremento: pisoCompleto.incremento || 0,
          depreciacion: pisoCompleto.depreciacion || 0,
          // Componentes estructurales
          codLetraMurosColumnas: pisoCompleto.codLetraMurosColumnas,
          murosColumnas: pisoCompleto.murosColumnas,
          codLetraTechos: pisoCompleto.codLetraTechos,
          techos: pisoCompleto.techos,
          codLetraPisos: pisoCompleto.codLetraPisos,
          pisos: pisoCompleto.pisos,
          codLetraPuertasVentanas: pisoCompleto.codLetraPuertasVentanas,
          puertasVentanas: pisoCompleto.puertasVentanas,
          codLetraRevestimiento: pisoCompleto.codLetraRevestimiento,
          revestimiento: pisoCompleto.revestimiento,
          codLetraBanios: pisoCompleto.codLetraBanios,
          banios: pisoCompleto.banios,
          codLetraInstalacionesElectricas: pisoCompleto.codLetraInstalacionesElectricas,
          instalacionesElectricas: pisoCompleto.instalacionesElectricas,
          codEstadoConservacion: pisoCompleto.codEstadoConservacion,
          codMaterialEstructural: pisoCompleto.codMaterialEstructural
        },
        // Datos del predio asociado
        predio: {
          id: predio.id,
          codPredio: predio.codPredio || predio.codigoPredio,
          codigoPredio: predio.codigoPredio,
          direccion: predio.direccion,
          tipoPredio: predio.tipoPredio,
          conductor: predio.conductor,
          areaTerreno: predio.areaTerreno,
          anio: predio.anio,
          numeroFinca: predio.numeroFinca,
          condicionPropiedad: predio.condicionPropiedad,
          estadoPredio: predio.estadoPredio
        },
        // Modo de edición
        modoEdicion: 'editar',
        descripcionAccion: `Editando piso ${pisoCompleto.numeroPiso} del predio ${pisoCompleto.codPredio}`
      };
      
      console.log('🚀 [ConsultaPisos] Navegando a RegistrosPisos con datos:', datosEdicion);
      
      // Navegar a la página de registro de pisos con los datos para edición
      navigate('/predio/pisos/registro', { 
        state: {
          modoEdicion: 'editar',
          datosEdicion: datosEdicion
        },
        replace: false 
      });
      
      // Mostrar notificación de navegación
      NotificationService.info(`Navegando a edición del piso ${pisoCompleto.numeroPiso}`);
      
    } else {
      console.warn('⚠️ [ConsultaPisos] No se encontraron datos completos para el piso o predio:', { piso, pisoCompleto, predio });
      NotificationService.error('No se pudo cargar la información completa del piso para editar');
    }
  };

  // Formatear número
  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  // Estilo base para celdas del header de tabla (responsive)
  const headerCellStyle = {
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
    textTransform: 'uppercase',
    letterSpacing: { xs: 0.2, sm: 0.3, md: 0.5 },
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    py: { xs: 1, sm: 1.5, md: 2 },
    px: { xs: 0.5, sm: 1, md: 2 },
    whiteSpace: 'nowrap'
  };

  // Estilo base para celdas del body de tabla (responsive)
  const bodyCellStyle = {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    py: { xs: 1, sm: 1.5, md: 2 },
    px: { xs: 0.5, sm: 1, md: 2 },
    verticalAlign: 'middle',
    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
  };

  return (
    <Box sx={{  width: '100%'}}>
      {/* Header Principal Mejorado */}
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
          width: '100%'
        }}
      >
        <Box sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          p: { xs: 2, sm: 2.5, md: 3 }
        }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'center', sm: 'center' }}
            spacing={2}
            sx={{ textAlign: { xs: 'center', sm: 'left' } }}
          >
            <Box sx={{
              p: { xs: 1.2, sm: 1.5 },
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <LayersIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                color="text.primary"
                sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' }
                }}
              >
                Consulta de Pisos
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Gestión y consulta de datos de pisos por predio
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Sección de Búsqueda Mejorada */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: { xs: 2, sm: 3 },
            pb: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <SearchIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
            <Typography 
              variant="h6" 
              fontWeight={600}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Seleccionar Predio
            </Typography>
          </Box>
          
          {/* Formulario de Búsqueda con mejor layout */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'flex-end' },
            mb: 3,
            p: 2,
            bgcolor: alpha(theme.palette.grey[50], 0.5),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
          }}>
            {/* Año */}
            <Box sx={{ flex: '0 0 100px' }}>
              <TextField
                fullWidth
                size="small"
                label="Año"
                type="number"
                value={filtros.anio || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, anio: parseInt(e.target.value) || new Date().getFullYear() }))}
                InputProps={{
                  inputProps: {
                    min: 1900,
                    max: new Date().getFullYear()
                  }
                }}
              />
            </Box>

            {/* Código Predio */}
            <Box sx={{ flex: '0 0 120px' }}>
              <TextField
                fullWidth
                size="small"
                label="Código Predio"
                value={filtros.codPredio}
                onChange={(e) => setFiltros(prev => ({ ...prev, codPredio: e.target.value }))}
                placeholder="Ej: 5"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Número Piso */}
            <Box sx={{ flex: '0 0 100px' }}>
              <TextField
                fullWidth
                size="small"
                label="Número Piso"
                value={filtros.numeroPiso}
                onChange={(e) => setFiltros(prev => ({ ...prev, numeroPiso: e.target.value }))}
                placeholder="Opcional"
              />
            </Box>

            {/* Botón Buscar */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{
                  height: 40,
                  minWidth: 100,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>

            {/* Botón Limpiar */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Button
                variant="outlined"
                onClick={handleLimpiar}
                startIcon={<ClearIcon />}
                sx={{
                  height: 40,
                  minWidth: 100
                }}
              >
                Limpiar
              </Button>
            </Box>
          </Box>


          <Divider sx={{ mb: 3 }} />
        </Box>
      </Paper>

      {/* Tabla de pisos mejorada */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
          width: '100%'
        }}
      >
        {/* Header de la tabla */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LayersIcon />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Datos del Piso
            </Typography>
          </Box>
          
          <Chip
            label={`${pisos.length} pisos encontrados`}
            color="primary"
            variant="filled"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {loading && <LinearProgress />}

        <TableContainer sx={{ 
          maxHeight: { xs: 400, sm: 450, md: 500 },
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: alpha(theme.palette.grey[100], 0.5),
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 2,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.5),
            }
          },
        }}>
          {pisos.length > 0 ? (
            <Table 
              stickyHeader 
              size="small"
              sx={{ 
                width: '100%', 
                minWidth: { xs: 900, sm: 1000, md: 1200 }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <LayersIcon sx={{ fontSize: { xs: 14, sm: 16, md: 20 } }} />
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>ITEM</Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={headerCellStyle}>
                    DESCRIPCIÓN
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: { xs: 14, sm: 16, md: 20 } }} />
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>VALOR UNITARIO</Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: { xs: 14, sm: 16, md: 20 } }} />
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>INCREMENTO %</Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>% DEPRECIACIÓN</Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>VALOR ÚNICO DEPRECIADO</Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>VALOR ÁREA CONSTRUIDA</Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>ÁREA CONSTRUIDA</Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>ÁREA TOTAL CONST.</Box>
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pisos.map((piso, index) => (
                  <Fade in={true} key={piso.id} timeout={300 + (index * 100)}>
                    <TableRow
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        '&:nth-of-type(even)': {
                          bgcolor: alpha(theme.palette.grey[50], 0.3),
                        },
                        // Solo el botón editar es clickeable, no toda la fila
                        '&:hover': {
                          bgcolor: alpha(theme.palette.grey[50], 0.5),
                        }
                      }}
                    >
                      <TableCell align="center" sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 0.5, sm: 1, md: 2 },
                        verticalAlign: 'middle'
                      }}>
                        <Chip 
                          label={piso.item} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 0.5, sm: 1, md: 2 },
                        verticalAlign: 'middle'
                      }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          sx={{ 
                            lineHeight: 1.43,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {piso.descripcion}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          color="info.main" 
                          sx={{ 
                            lineHeight: 1.43,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {formatNumber(piso.valorUnitario)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Chip 
                          label={`${formatNumber(piso.incremento)}%`}
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{
                            fontWeight: 500,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Chip 
                          label={`${formatNumber(piso.porcentajeDepreciacion)}%`}
                          size="small"
                          color="warning"
                          variant="filled"
                          sx={{
                            fontWeight: 500,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          color="secondary.main" 
                          sx={{ 
                            lineHeight: 1.43,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {formatNumber(piso.valorUnicoDepreciado)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="primary.main"
                          sx={{
                            lineHeight: 1.43,
                            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
                          }}
                        >
                          {formatNumber(piso.valorAreaConstruida)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color="info.main"
                          sx={{
                            lineHeight: 1.43,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {formatNumber(piso.areaConstruida)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color="success.main"
                          sx={{
                            lineHeight: 1.43,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {formatNumber(piso.areaTotalConstruccion)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={bodyCellStyle}>
                        <Tooltip
                          title="Editar datos del piso" 
                          arrow
                          placement="top"
                          enterDelay={500}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Evitar que el click se propague a la fila
                              handleEdit(piso);
                            }}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.16),
                                transform: 'scale(1.1)',
                                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                              },
                              '&:active': {
                                transform: 'scale(0.95)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              width: { xs: 28, sm: 32, md: 36 },
                              height: { xs: 28, sm: 32, md: 36 }
                            }}
                          >
                            <EditIcon 
                              sx={{ 
                                color: theme.palette.primary.main,
                                fontSize: { xs: 16, sm: 18, md: 20 }
                              }} 
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Stack alignItems="center" spacing={3}>
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                }}>
                  <LayersIcon sx={{ 
                    fontSize: 64, 
                    color: alpha(theme.palette.primary.main, 0.4)
                  }} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {predio 
                      ? 'No se encontraron pisos para este predio'
                      : 'Seleccione un predio para buscar'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    {predio 
                      ? 'El predio seleccionado no tiene pisos registrados para el año especificado'
                      : 'Utilice el botón "Seleccionar" para elegir un predio y luego presione "Buscar"'
                    }
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </TableContainer>
      </Paper>

      {/* Información adicional */}
      <Box sx={{ 
        mt: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.grey[50], 0.8),
        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        width: '100%'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {predio 
            ? `Predio: ${predio.codPredio || predio.codigoPredio} | Año: ${filtros.anio} | Pisos encontrados: ${pisos.length}`
            : 'Seleccione un predio para comenzar la consulta'
          }
        </Typography>
        {pisos.length > 0 && (
          <Chip
            label="Datos actualizados"
            color="success"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>

      {/* Modal de selección de predios */}
      <SelectorPredios
        open={showSelectorPredios}
        onClose={() => setShowSelectorPredios(false)}
        onSelect={handleSelectPredio}
      />
    </Box>
  );
};

export default ConsultaPisos;