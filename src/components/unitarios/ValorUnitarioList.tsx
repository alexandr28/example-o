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
  TextField,
  Tooltip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { LetraValorUnitario } from '../../models';
import { valorUnitarioService } from '../../services/valorUnitarioService';
import { useValoresUnitarios } from '../../hooks/useValoresUnitarios';

interface ValorUnitarioListProps {
  años: { value: string, label: string }[];
  añoSeleccionado?: number | null;
  onValorSeleccionado?: (datos: {
    año: number;
    categoria: string;
    subcategoria: string;
    letra: string;
    costo: number;
  }) => void;
}

const ValorUnitarioList: React.FC<ValorUnitarioListProps> = ({
  años,
  añoSeleccionado,
  onValorSeleccionado
}) => {
  const theme = useTheme();
  
  // IMPORTANTE: El hook debe estar en el nivel superior del componente
  const { obtenerValoresUnitariosPorCategoria } = useValoresUnitarios();
  
  // Estados locales - Usar año seleccionado del formulario o año actual como fallback
  const currentYear = new Date().getFullYear();
  const [añoTabla, setAñoTabla] = useState<number | null>(añoSeleccionado || currentYear);
  const [valoresPorCategoria, setValoresPorCategoria] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar añoTabla con añoSeleccionado solo en la primera carga
  useEffect(() => {
    if (añoSeleccionado !== null && añoSeleccionado !== undefined) {
      console.log('🔄 [ValorUnitarioList] Inicializando año con:', añoSeleccionado);
      setAñoTabla(añoSeleccionado);
    }
  }, [añoSeleccionado]); // Removemos añoTabla de las dependencias para evitar loops

  // Cargar valores unitarios cuando cambia el año usando GET API con query params
  useEffect(() => {
    console.log(`🔄 [ValorUnitarioList] useEffect disparado con añoTabla: ${añoTabla}`);
    
    const cargarValoresUnitarios = async () => {
      if (!añoTabla) {
        console.log(`⚠️ [ValorUnitarioList] No hay año seleccionado, limpiando datos`);
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
        
        // USAR LA FUNCIÓN DEL HOOK QUE YA ESTÁ DECLARADA
        console.log(`🔧 [ValorUnitarioList] Usando obtenerValoresUnitariosPorCategoria con año: ${añoTabla}`);
        console.log(`🔧 [ValorUnitarioList] Tipo de añoTabla:`, typeof añoTabla, 'Valor real:', añoTabla);
        
        // VALIDACIÓN EXPLÍCITA antes de llamar al hook
        if (typeof añoTabla !== 'number' || añoTabla <= 0) {
          console.error('❌ [ValorUnitarioList] añoTabla no es un número válido:', añoTabla);
          throw new Error(`Año inválido: ${añoTabla}`);
        }
        
        console.log(`📤 [ValorUnitarioList] Cargando valores para año ${añoTabla}`);
        // LLAMADA DIRECTA AL SERVICIO usando parámetro 'anio'
        const valores = await valorUnitarioService.consultarValoresUnitarios({ anio: añoTabla });
        
        // Agrupar por subcategoría y letra (para la tabla)
        const resultado: Record<string, Record<string, number>> = {};
        
        // Función para normalizar nombres de subcategorías
        const normalizarSubcategoria = (subcategoria: string): string => {
          // Mapeo para diferentes variaciones del nombre que pueden venir del API
          const normalizacionMap: Record<string, string> = {
            'MUROS Y COLUMNAS': 'MUROS Y COLUMNAS',
            'MUROS_Y_COLUMNAS': 'MUROS Y COLUMNAS',
            'TECHOS': 'TECHOS',
            'PISOS': 'PISOS',
            'PUERTAS Y VENTANAS': 'PUERTAS Y VENTANAS',
            'PUERTAS_Y_VENTANAS': 'PUERTAS Y VENTANAS',
            'REVESTIMIENTOS': 'REVESTIMIENTOS',
            'BAÑOS': 'BAÑOS',
            'BANOS': 'BAÑOS',
            'INSTALACIONES ELECTRICAS Y SANITARIAS': 'INSTALACIONES ELECTRICAS Y SANITARIAS',
            'INSTALACIONES_ELECTRICAS_Y_SANITARIAS': 'INSTALACIONES ELECTRICAS Y SANITARIAS'
          };
          
          return normalizacionMap[subcategoria] || subcategoria;
        };
        
        valores.forEach((valor) => {
          const subcategoriaNormalizada = normalizarSubcategoria(valor.subcategoria);
          
          if (!resultado[subcategoriaNormalizada]) {
            resultado[subcategoriaNormalizada] = {};
          }
          resultado[subcategoriaNormalizada][valor.letra] = valor.costo;
          
          console.log(`📊 [ValorUnitarioList] Valor agregado: ${subcategoriaNormalizada}/${valor.letra} = ${valor.costo}`);
        });
        
        console.log(`✅ [ValorUnitarioList] Cargados ${valores.length} valores para ${Object.keys(resultado).length} subcategorías`);
        
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
  }, [añoTabla, obtenerValoresUnitariosPorCategoria]);


  // Mapear subcategorías del API a categorías del formulario
  const mapearSubcategoriaACategoria = (subcategoria: string) => {
    const mapa: Record<string, string> = {
      'MUROS Y COLUMNAS': 'ESTRUCTURAS',
      'TECHOS': 'ESTRUCTURAS', 
      'PISOS': 'ACABADOS',
      'PUERTAS Y VENTANAS': 'ACABADOS',
      'REVESTIMIENTOS': 'ACABADOS',
      'BAÑOS': 'ACABADOS',
      'INSTALACIONES ELECTRICAS Y SANITARIAS': 'INSTALACIONES'
    };
    console.log('🗺️ [ValorUnitarioList] Mapeando subcategoría:', subcategoria, 'a categoría:', mapa[subcategoria]);
    return mapa[subcategoria] || 'ACABADOS';  // Default a ACABADOS
  };

  // Handler para clic en celda de valor
  const handleCeldaClick = (subcategoria: string, letra: string, costo: number) => {
    if (!onValorSeleccionado || !añoTabla || costo <= 0) return;
    
    // Mapear subcategoría a categoría
    const categoria = mapearSubcategoriaACategoria(subcategoria);
    
    console.log(`🎯 [ValorUnitarioList] Valor seleccionado:`, { 
      subcategoria, 
      categoria, 
      letra, 
      costo 
    });
    
    onValorSeleccionado({
      año: añoTabla,
      categoria: categoria,
      subcategoria: subcategoria,
      letra: letra,
      costo: costo
    });
  };


  // Subcategorías para la tabla - ORDENADAS por categoría según especificación del usuario
  // ESTRUCTURAS: Muros y Columnas, Techos
  // ACABADOS: Pisos, Puertas y Ventanas, Revestimientos, Baños
  // INSTALACIONES: Instalaciones Eléctricas y Sanitarias
  const subcategoriasTabla = [
    // ESTRUCTURAS
    { value: 'MUROS Y COLUMNAS', label: 'Muros y Columnas', color: '#1976d2', apiCode: '100101', categoria: 'ESTRUCTURAS' },
    { value: 'TECHOS', label: 'Techos', color: '#388e3c', apiCode: '100102', categoria: 'ESTRUCTURAS' },
    
    // ACABADOS - CÓDIGOS CORREGIDOS
    { value: 'PISOS', label: 'Pisos', color: '#d32f2f', apiCode: '100201', categoria: 'ACABADOS' },
    { value: 'PUERTAS Y VENTANAS', label: 'Puertas y Ventanas', color: '#7b1fa2', apiCode: '100202', categoria: 'ACABADOS' },
    { value: 'REVESTIMIENTOS', label: 'Revestimientos', color: '#f57c00', apiCode: '100203', categoria: 'ACABADOS' },
    { value: 'BAÑOS', label: 'Baños', color: '#795548', apiCode: '100204', categoria: 'ACABADOS' },
    
    // INSTALACIONES
    { value: 'INSTALACIONES ELECTRICAS Y SANITARIAS', label: 'Instalaciones Eléctricas y Sanitarias', color: '#0288d1', apiCode: '100301', categoria: 'INSTALACIONES' }
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
            {/* Año */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 120px' },
              minWidth: { xs: '100%', md: '120px' }
            }}>
              <TextField
                fullWidth
                size="small"
                label="Año"
                type="number"
                value={añoTabla || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log(`📝 [ValorUnitarioList] Cambiando valor del input a: "${value}"`);
                  if (value === '') {
                    console.log(`📝 [ValorUnitarioList] Valor vacío, estableciendo null`);
                    setAñoTabla(null);
                  } else {
                    const nuevoAño = parseInt(value);
                    console.log(`📝 [ValorUnitarioList] Parseado a: ${nuevoAño}`);
                    if (!isNaN(nuevoAño)) {
                      console.log(`📝 [ValorUnitarioList] Estableciendo año: ${nuevoAño}`);
                      setAñoTabla(nuevoAño);
                    }
                  }
                }}
                InputProps={{
                  inputProps: { 
                    min: 1900, 
                    max: new Date().getFullYear() 
                  }
                }}
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
                      align="center"
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: theme.palette.grey[100],
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        position: 'sticky',
                        left: 0,
                        zIndex: 2
                      }}
                    >
                      LETRAS
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
                        <TableCell align="center">
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
                    letrasTabla.map((letra, _index) => (
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
                          align="center"
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
                              onClick={() => handleCeldaClick(subcategoria.value, letra, value)}
                              sx={{ 
                                fontWeight: value > 0 ? 500 : 400,
                                color: value > 0 ? theme.palette.text.primary : theme.palette.text.disabled,
                                bgcolor: getCellColor(value),
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.2s ease',
                                cursor: value > 0 ? 'pointer' : 'default',
                                '&:hover': {
                                  bgcolor: value > 0 ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                  transform: value > 0 ? 'scale(1.05)' : 'none'
                                }
                              }}
                            >
                              <Tooltip title={value > 0 ? 'Hacer clic para editar este valor' : 'Sin valor'}>
                                <Box component="span">
                                  {value > 0 ? value.toFixed(2) : '0.00'}
                                </Box>
                              </Tooltip>
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