// src/components/alcabala/AlcabalaForm.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Pagination,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface AlcabalaFormProps {
  aniosDisponibles: { value: number; label: string }[];
  anioSeleccionado: number | null;
  tasa: number;
  alcabalas: any[];
  paginacion: {
    paginaActual: number;
    totalPaginas: number;
    totalRegistros: number;
    registrosPorPagina: number;
  };
  onAnioChange: (anio: number | null) => void;
  onTasaChange: (tasa: number) => void;
  onRegistrar: () => void;
  onCambiarPagina: (pagina: number) => void;
  loading?: boolean;
  onEditar?: (alcabala: any) => void;
  onEliminar?: (alcabala: any) => void;
}

const AlcabalaForm: React.FC<AlcabalaFormProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  tasa,
  alcabalas,
  paginacion,
  onAnioChange,
  onTasaChange,
  onRegistrar,
  onCambiarPagina,
  loading = false,
  onEditar,
  onEliminar
}) => {
  return (
    <Box>
      {/* Formulario de registro */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Registrar Nueva Alcabala
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            alignItems: 'flex-end' 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 12px)' },
              minWidth: 0
            }}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  value={anioSeleccionado || ''}
                  onChange={(e) => onAnioChange(e.target.value ? Number(e.target.value) : null)}
                  label="Año"
                >
                  <MenuItem value="">
                    <em>Seleccione un año</em>
                  </MenuItem>
                  {aniosDisponibles.map((anio) => (
                    <MenuItem key={anio.value} value={anio.value}>
                      {anio.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 12px)' },
              minWidth: 0
            }}>
              <TextField
                fullWidth
                label="Tasa (%)"
                type="number"
                value={tasa}
                onChange={(e) => onTasaChange(Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { 
                    min: 0, 
                    max: 100,
                    step: 0.1
                  }
                }}
              />
            </Box>
            
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 12px)' },
              minWidth: 0
            }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={onRegistrar}
                disabled={loading || !anioSeleccionado || tasa <= 0}
                sx={{ height: '56px' }}
              >
                Registrar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de alcabalas registradas */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alcabalas Registradas
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Año</TableCell>
                      <TableCell align="right">Tasa (%)</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alcabalas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay alcabalas registradas
                        </TableCell>
                      </TableRow>
                    ) : (
                      alcabalas.map((alcabala) => (
                        <TableRow key={alcabala.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {alcabala.anio}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {alcabala.tasa.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alcabala.estado}
                              color={alcabala.estado === 'ACTIVO' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEditar?.(alcabala)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onEliminar?.(alcabala)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Paginación */}
              {paginacion.totalPaginas > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={paginacion.totalPaginas}
                    page={paginacion.paginaActual}
                    onChange={(_, page) => onCambiarPagina(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlcabalaForm;