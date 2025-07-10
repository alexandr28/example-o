// src/components/depreciacion/BuscarDepreciacion.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Grid,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';

interface BuscarDepreciacionProps {
  aniosDisponibles: { value: string, label: string }[];
  tiposCasa: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tipoCasaSeleccionado: string | null;
  onAnioChange: (anio: number | null) => void;
  onTipoCasaChange: (tipoCasa: string | null) => void;
  onBuscar: () => void;
  loading?: boolean;
}

// Datos mock para la tabla
const mockDepreciaciones = [
  { antiguedad: 'Hasta 5 años', material: 'Concreto', muyBueno: 0.00, bueno: 0.00, regular: 0.00, malo: 0.00 },
  { antiguedad: 'Hasta 5 años', material: 'Ladrillo', muyBueno: 0.00, bueno: 0.00, regular: 0.00, malo: 0.00 },
  { antiguedad: 'Hasta 5 años', material: 'Adobe', muyBueno: 0.00, bueno: 0.00, regular: 0.00, malo: 0.00 },
  { antiguedad: 'Hasta 10 años', material: 'Concreto', muyBueno: 0.00, bueno: 0.00, regular: 0.00, malo: 0.00 },
  { antiguedad: 'Hasta 10 años', material: 'Ladrillo', muyBueno: 0.00, bueno: 0.00, regular: 0.00, malo: 0.00 },
];

/**
 * Componente para búsqueda de depreciación con Material-UI
 */
const BuscarDepreciacion: React.FC<BuscarDepreciacionProps> = ({
  aniosDisponibles,
  tiposCasa,
  anioSeleccionado,
  tipoCasaSeleccionado,
  onAnioChange,
  onTipoCasaChange,
  onBuscar,
  loading = false
}) => {
  const theme = useTheme();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Convertir opciones al formato de SearchableSelect
  const anioOptions = aniosDisponibles.map(anio => ({
    id: anio.value,
    value: parseInt(anio.value),
    label: anio.label,
    description: anio.value === new Date().getFullYear().toString() ? 'Año actual' : undefined
  }));

  const tipoCasaOptions = tiposCasa.map(tipo => ({
    id: tipo.value,
    value: tipo.value,
    label: tipo.label
  }));

  // Manejar búsqueda
  const handleBuscar = () => {
    onBuscar();
    setHasSearched(true);
    // Simular resultados
    setTimeout(() => {
      setSearchResults(mockDepreciaciones);
    }, 500);
  };

  // Obtener color del material
  const getMaterialColor = (material: string): string => {
    switch (material) {
      case 'Concreto': return theme.palette.primary.main;
      case 'Ladrillo': return theme.palette.warning.main;
      case 'Adobe': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SearchIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Búsqueda de depreciación
          </Typography>
        </Stack>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <SearchableSelect
              label="Año"
              options={anioOptions}
              value={anioSeleccionado ? anioOptions.find(opt => opt.value === anioSeleccionado) || null : null}
              onChange={(option) => onAnioChange(option ? option.value : null)}
              placeholder="Seleccione"
              disabled={loading}
              size="small"
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">{option.label}</Typography>
                  </Stack>
                </Box>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <SearchableSelect
              label="Tipos de casa"
              options={tipoCasaOptions}
              value={tipoCasaSeleccionado ? tipoCasaOptions.find(opt => opt.value === tipoCasaSeleccionado) || null : null}
              onChange={(option) => onTipoCasaChange(option ? option.value : null)}
              placeholder="Seleccione"
              disabled={loading}
              size="small"
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HomeIcon fontSize="small" color="action" />
                    <Typography variant="body2">{option.label}</Typography>
                  </Stack>
                </Box>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleBuscar}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{ height: 40 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de resultados */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, pb: 3 }}>
        {loading ? (
          <Stack spacing={1}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} height={50} animation="wave" />
            ))}
          </Stack>
        ) : hasSearched && searchResults.length > 0 ? (
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{ maxHeight: 400 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    ANTIGÜEDAD
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    MATERIAL
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    MUY BUENO
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    BUENO
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    REGULAR
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    MALO
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      width: 100
                    }}
                  >
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((row, index) => (
                  <TableRow 
                    key={index}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {row.antiguedad}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<ConstructionIcon fontSize="small" />}
                        label={row.material}
                        size="small"
                        sx={{
                          bgcolor: alpha(getMaterialColor(row.material), 0.1),
                          color: getMaterialColor(row.material),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {row.muyBueno.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {row.bueno.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {row.regular.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {row.malo.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : hasSearched ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No se encontraron resultados para los criterios seleccionados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Seleccione los criterios y haga clic en buscar
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default BuscarDepreciacion;