// src/components/unitarios/ValorUnitarioList.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  TableChart as TableIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { LetraValorUnitario, SubcategoriaValorUnitario } from '../../models';
import { valorUnitarioService } from '../../services/valorUnitarioService';
import { API_CONFIG } from '../../config/api.unified.config';
import { useValoresUnitarios } from '../../hooks/useValoresUnitarios';

interface ValorUnitarioListProps {
  años: { value: string, label: string }[];
}

const ValorUnitarioList: React.FC<ValorUnitarioListProps> = ({
  años
}) => {
  const theme = useTheme();
  
  // Estados locales - Inicializar con el año actual
  const currentYear = new Date().getFullYear();
  const [añoTabla, setAñoTabla] = useState<number | null>(currentYear);
  const [valoresPorCategoria, setValoresPorCategoria] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 [ValorUnitarioList] Inicializando con año actual:', currentYear);

  // Cargar valores unitarios cuando cambia el año usando GET API con query params
  useEffect(() => {
    const cargarValoresUnitarios = async () => {
      if (!añoTabla) {
        setValoresPorCategoria({});
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 [ValorUnitarioList] Cargando valores para año ${añoTabla} usando API GET con query params`);
        console.log(`📊 [ValorUnitarioList] Verificación del valor añoTabla:`, añoTabla, typeof añoTabla);
        
        // Verificar que añoTabla no sea null o undefined
        if (!añoTabla) {
          console.log('❌ [ValorUnitarioList] añoTabla es null o undefined, cancelando petición');
          setValoresPorCategoria({});
          return;
        }
        
        // USAR EL HOOK useValoresUnitarios QUE YA ESTÁ IMPLEMENTADO
        console.log(`🔧 [ValorUnitarioList] Usando obtenerValoresUnitariosPorCategoria con año: ${añoTabla}`);
        
        // Usar el hook que ya maneja todo el procesamiento
        const { obtenerValoresUnitariosPorCategoria } = useValoresUnitarios();
        const resultado = await obtenerValoresUnitariosPorCategoria(añoTabla);
        
        console.log(`✅ [ValorUnitarioList] Resultado del hook:`, resultado);
        setValoresPorCategoria(resultado);
        
      } catch (err: any) {
        console.error('❌ [ValorUnitarioList] Error cargando valores:', err);
        setError(err.message || 'Error al cargar los valores unitarios');
        setValoresPorCategoria({});
      } finally {
        setLoading(false);
      }
    };

    cargarValoresUnitarios();
  }, [añoTabla]);

  // Handler para cambio de año
  const handleAñoTablaChange = (año: number | null) => {
    console.log(`🎯 [ValorUnitarioList] Año seleccionado: ${año}`);
    setAñoTabla(año);
  };

  // Convertir años al formato de SearchableSelect
  const añoOptions = años.map(año => ({
    id: año.value,
    value: parseInt(año.value),
    label: año.label,
    description: año.value === new Date().getFullYear().toString() ? 'Año actual' : undefined
  }));

  // Subcategorías para la tabla con íconos y colores
  const subcategoriasTabla = [
    { value: SubcategoriaValorUnitario.MUROS_Y_COLUMNAS, label: 'Muros y Columnas', color: '#1976d2' },
    { value: SubcategoriaValorUnitario.TECHOS, label: 'Techo', color: '#388e3c' },
    { value: SubcategoriaValorUnitario.PISOS, label: 'Pisos', color: '#d32f2f' },
    { value: SubcategoriaValorUnitario.PUERTAS_Y_VENTANAS, label: 'Puertas y Ventanas', color: '#7b1fa2' },
    { value: SubcategoriaValorUnitario.REVESTIMIENTOS, label: 'Revestimiento', color: '#f57c00' },
    { value: SubcategoriaValorUnitario.INSTALACIONES_ELECTRICAS_Y_SANITARIAS, label: 'Instalaciones Eléctricas y Sanitarias', color: '#0288d1' }
  ];

  // Letras para la tabla
  const letrasTabla = Object.values(LetraValorUnitario);

  // Función para obtener el color de fondo según el valor
  const getCellColor = (value: number): string => {
    if (value === 0) return 'transparent';
    if (value < 50) return alpha(theme.palette.success.main, 0.1);
    if (value < 100) return alpha(theme.palette.warning.main, 0.1);
    return alpha(theme.palette.error.main, 0.1);
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        mt: 3,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header mejorado con selector de año */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TableIcon />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Tabla de Valores por Categoría
              </Typography>
            </Box>
            
            <Box sx={{ width: 280 }}>
              <Autocomplete
                options={años}
                getOptionLabel={(option) => option.label}
                value={años.find(a => parseInt(a.value) === añoTabla) || null}
                onChange={(_, newValue) => {
                  handleAñoTablaChange(newValue ? parseInt(newValue.value) : null);
                }}
                loading={loading}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Año de consulta"
                    size="small"
                    placeholder="Seleccione año"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: 40,
                        backgroundColor: 'white'
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Mensaje si no hay año seleccionado */}
          {!añoTabla && !error && (
            <Alert severity="info" icon={<CalendarIcon />}>
              Seleccione un año para visualizar la tabla de valores unitarios
            </Alert>
          )}

          {/* Tabla de valores */}
          {añoTabla && (
            <TableContainer 
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: theme.palette.grey[100],
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        position: 'sticky',
                        left: 0,
                        zIndex: 2
                      }}
                    >
                      CATEGORÍA
                    </TableCell>
                    {subcategoriasTabla.map((subcategoria) => (
                      <TableCell 
                        key={subcategoria.value} 
                        align="center"
                        sx={{ 
                          fontWeight: 600,
                          bgcolor: theme.palette.grey[100],
                          borderBottom: `2px solid ${theme.palette.divider}`,
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          borderLeft: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {subcategoria.label.toUpperCase()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    // Skeleton loading
                    [...Array(9)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton width={30} height={30} />
                        </TableCell>
                        {subcategoriasTabla.map((_, subIndex) => (
                          <TableCell key={subIndex} align="center">
                            <Skeleton width={60} height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    letrasTabla.map((letra, index) => (
                      <TableRow 
                        key={letra} 
                        hover
                        sx={{
                          '&:nth-of-type(even)': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            fontWeight: 600,
                            position: 'sticky',
                            left: 0,
                            bgcolor: theme.palette.background.paper,
                            borderRight: `2px solid ${theme.palette.divider}`,
                            zIndex: 1
                          }}
                        >
                          <Chip
                            label={letra}
                            size="small"
                            sx={{
                              fontWeight: 'bold',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          />
                        </TableCell>
                        {subcategoriasTabla.map((subcategoria) => {
                          const value = valoresPorCategoria[subcategoria.value]?.[letra] || 0;
                          return (
                            <TableCell 
                              key={`${letra}-${subcategoria.value}`} 
                              align="center"
                              sx={{ 
                                fontWeight: value > 0 ? 500 : 400,
                                color: value > 0 ? theme.palette.text.primary : theme.palette.text.disabled,
                                bgcolor: getCellColor(value),
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: value > 0 ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                  transform: value > 0 ? 'scale(1.05)' : 'none'
                                }
                              }}
                            >
                              {value > 0 ? value.toFixed(2) : '0.00'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Leyenda */}
          {añoTabla && !loading && (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Leyenda de valores:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label="< 50" 
                  size="small" 
                  sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                />
                <Chip 
                  label="50-100" 
                  size="small" 
                  sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                />
                <Chip 
                  label="> 100" 
                  size="small" 
                  sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ValorUnitarioList;