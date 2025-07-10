// src/components/predio/pisos/ConsultaPisos.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  Alert,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Domain as DomainIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { usePisos } from '../../../hooks/usePisos';
import SelectorPredios from './SelectorPredios';

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
}

interface Predio {
  id: number | string;
  codigoPredio: string;
  direccion?: string;
  tipoPredio?: string;
  contribuyente?: string;
  areaTerreno?: number;
}

const ConsultaPisos: React.FC = () => {
  const theme = useTheme();
  const { buscarPisos, loading } = usePisos();
  
  // Estados
  const [predio, setPredio] = useState<Predio | null>(null);
  const [pisos, setPisos] = useState<Piso[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(new Date().getFullYear().toString());
  const [showSelectorPredios, setShowSelectorPredios] = useState(false);
  
  // Generar años disponibles
  const currentYear = new Date().getFullYear();
  const anios = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  // Buscar pisos
  const handleBuscar = async () => {
    if (!predio) {
      return;
    }

    try {
      const resultado = await buscarPisos(predio.codigoPredio, parseInt(anioSeleccionado));
      setPisos(resultado);
    } catch (error) {
      console.error('Error al buscar pisos:', error);
    }
  };

  // Seleccionar predio
  const handleSelectPredio = (predioSeleccionado: Predio) => {
    setPredio(predioSeleccionado);
    setPisos([]); // Limpiar pisos al cambiar de predio
  };

  // Editar piso
  const handleEdit = (piso: Piso) => {
    console.log('Editar piso:', piso);
    // Aquí iría la navegación o apertura de modal de edición
  };

  // Formatear número
  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Sección: Seleccionar predio */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <DomainIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Seleccionar predio
            </Typography>
          </Stack>
          
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowSelectorPredios(true)}
                startIcon={<SearchIcon />}
                sx={{ height: 56 }}
              >
                Seleccionar predio
              </Button>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código de predio"
                value={predio?.codigoPredio || ''}
                placeholder="Código de predio"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <HomeIcon sx={{ mr: 1, color: 'action.active' }} />
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Dirección predial"
                value={predio?.direccion || ''}
                placeholder="Dirección predial"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <LocationIcon sx={{ mr: 1, color: 'action.active' }} />
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(e.target.value)}
                  label="Año"
                  startAdornment={
                    <CalendarIcon sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />
                  }
                >
                  {anios.map(anio => (
                    <MenuItem key={anio.value} value={anio.value}>
                      {anio.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleBuscar}
                disabled={loading || !predio}
                startIcon={loading ? null : <SearchIcon />}
                sx={{ height: 56 }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección: Datos del piso */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Datos del piso
          </Typography>
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          {pisos.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell align="center">ITEM</TableCell>
                  <TableCell>DESCRIPCIÓN</TableCell>
                  <TableCell align="center">VALOR UNITARIO</TableCell>
                  <TableCell align="center">INCREMENTO %</TableCell>
                  <TableCell align="center">% DEPRECIACIÓN</TableCell>
                  <TableCell align="center">VALOR ÚNICO DEPRECIADO</TableCell>
                  <TableCell align="center">VALOR ÁREA CONSTRUIDA</TableCell>
                  <TableCell align="center">ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pisos.map((piso) => (
                  <TableRow key={piso.id} hover>
                    <TableCell align="center">
                      <Chip label={piso.item} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{piso.descripcion}</TableCell>
                    <TableCell align="center">
                      {formatNumber(piso.valorUnitario)}
                    </TableCell>
                    <TableCell align="center">
                      {formatNumber(piso.incremento)}%
                    </TableCell>
                    <TableCell align="center">
                      {formatNumber(piso.porcentajeDepreciacion)}%
                    </TableCell>
                    <TableCell align="center">
                      {formatNumber(piso.valorUnicoDepreciado)}
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600} color="primary">
                        {formatNumber(piso.valorAreaConstruida)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(piso)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay datos para mostrar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seleccione un predio y año, luego presione buscar
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Paper>

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