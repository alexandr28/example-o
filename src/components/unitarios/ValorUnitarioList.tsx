// src/components/unitarios/ValorUnitarioList.tsx
import React from 'react';
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
  Alert
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  TableChart as TableIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { LetraValorUnitario, SubcategoriaValorUnitario } from '../../models';

interface ValorUnitarioListProps {
  años: { value: string, label: string }[];
  añoTabla: number | null;
  valoresPorCategoria: Record<string, Record<string, number>>;
  loading: boolean;
  onAñoTablaChange: (año: number | null) => void;
}

const ValorUnitarioList: React.FC<ValorUnitarioListProps> = ({
  años,
  añoTabla,
  valoresPorCategoria,
  loading,
  onAñoTablaChange
}) => {
  const theme = useTheme();

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
      elevation={1}
      sx={{ 
        mt: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header con selector de año */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <TableIcon color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Tabla de Valores por Categoría
              </Typography>
            </Stack>
            
            <Box sx={{ width: 250 }}>
              <SearchableSelect
                label="Año de consulta"
                options={añoOptions}
                value={añoTabla ? añoOptions.find(opt => opt.value === añoTabla) || null : null}
                onChange={(option) => onAñoTablaChange(option ? option.value : null)}
                placeholder="Seleccione el año"
                disabled={loading}
                size="small"
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                )}
              />
            </Box>
          </Stack>

          {/* Mensaje si no hay año seleccionado */}
          {!añoTabla && (
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