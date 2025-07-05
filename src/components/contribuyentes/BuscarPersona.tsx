// src/components/contribuyentes/BuscarPersonaMUI.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { personaService, PersonaData, TIPO_PERSONA_CODES } from '../../services/personaService';

interface BuscarPersonaProps {
  open: boolean;
  onClose: () => void;
  onSelectPersona: (persona: PersonaData) => void;
  tipoPersonaInicial?: 'PERSONA_NATURAL' | 'PERSONA_JURIDICA';
}

const BuscarPersonaMUI: React.FC<BuscarPersonaProps> = ({ 
  open,
  onClose,
  onSelectPersona, 
  tipoPersonaInicial = 'PERSONA_NATURAL' 
}) => {
  const theme = useTheme();
  const [tipoPersona, setTipoPersona] = useState(tipoPersonaInicial);
  const [busqueda, setBusqueda] = useState('');
  const [personas, setPersonas] = useState<PersonaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaData | null>(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleBuscar = async () => {
    if (busqueda.trim().length < 3) {
      setError('Ingrese al menos 3 caracteres para buscar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const codTipoPersona = tipoPersona === 'PERSONA_JURIDICA' 
        ? TIPO_PERSONA_CODES.PERSONA_JURIDICA 
        : TIPO_PERSONA_CODES.PERSONA_NATURAL;
      
      const resultado = await personaService.buscarPersona(codTipoPersona, busqueda);
      setPersonas(resultado);
      setPage(0); // Resetear a la primera página
      
      if (resultado.length === 0) {
        setError('No se encontraron resultados');
      }
    } catch (error: any) {
      console.error('Error al buscar persona:', error);
      setError(error.message || 'Error al buscar persona');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = (persona: PersonaData) => {
    setSelectedPersona(persona);
  };

  const handleConfirmar = () => {
    if (selectedPersona) {
      onSelectPersona(selectedPersona);
      handleClose();
    }
  };

  const handleClose = () => {
    setBusqueda('');
    setPersonas([]);
    setSelectedPersona(null);
    setError(null);
    setPage(0);
    onClose();
  };

  const handleTipoPersonaChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: 'PERSONA_NATURAL' | 'PERSONA_JURIDICA' | null
  ) => {
    if (newValue !== null) {
      setTipoPersona(newValue);
      setPersonas([]);
      setError(null);
    }
  };

  // Calcular personas paginadas
  const personasPaginadas = personas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon color="primary" />
            <Typography variant="h6">Buscar Persona</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Selector de tipo de persona */}
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Tipo de Persona
            </Typography>
            <ToggleButtonGroup
              value={tipoPersona}
              exclusive
              onChange={handleTipoPersonaChange}
              aria-label="tipo de persona"
              fullWidth
            >
              <ToggleButton value="PERSONA_NATURAL" aria-label="persona natural">
                <PersonIcon sx={{ mr: 1 }} />
                Persona Natural
              </ToggleButton>
              <ToggleButton value="PERSONA_JURIDICA" aria-label="persona jurídica">
                <BusinessIcon sx={{ mr: 1 }} />
                Persona Jurídica
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Campo de búsqueda */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                label={tipoPersona === 'PERSONA_JURIDICA' ? 'Razón Social o RUC' : 'Nombre o DNI'}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBuscar();
                  }
                }}
                placeholder={
                  tipoPersona === 'PERSONA_JURIDICA' 
                    ? 'Ingrese razón social o RUC...'
                    : 'Ingrese nombre, apellido o DNI...'
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={loading || busqueda.length < 3}
                startIcon={<SearchIcon />}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && <LinearProgress />}

          {/* Tabla de resultados */}
          {personas.length > 0 && (
            <Paper variant="outlined">
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Documento</TableCell>
                      <TableCell>
                        {tipoPersona === 'PERSONA_JURIDICA' ? 'Razón Social' : 'Nombre Completo'}
                      </TableCell>
                      <TableCell>Dirección</TableCell>
                      <TableCell align="center">Seleccionar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {personasPaginadas.map((persona) => (
                      <TableRow
                        key={persona.codigo}
                        hover
                        selected={selectedPersona?.codigo === persona.codigo}
                        onClick={() => handleSelectPersona(persona)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Chip
                            icon={<BadgeIcon />}
                            label={persona.numeroDocumento}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tipoPersona === 'PERSONA_JURIDICA' 
                              ? persona.razonSocial 
                              : `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {persona.direccion || 'Sin dirección'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color={selectedPersona?.codigo === persona.codigo ? 'primary' : 'default'}
                          >
                            {selectedPersona?.codigo === persona.codigo && <CheckIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Paginación */}
              <TablePagination
                component="div"
                count={personas.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          disabled={!selectedPersona}
          startIcon={<CheckIcon />}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuscarPersonaMUI;