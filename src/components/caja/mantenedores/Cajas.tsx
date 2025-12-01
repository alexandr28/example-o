// src/components/caja/mantenedores/Cajas.tsx
import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
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
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Search as SearchIcon,
  AppRegistration as RegistrationIcon,
  FindInPage as FindIcon
} from '@mui/icons-material';
import { useMantenedorCaja } from '../../../hooks/useMantenedorCaja';
import { NotificationService } from '../../utils/Notification';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cajas-tabpanel-${index}`}
      aria-labelledby={`cajas-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Cajas: React.FC = () => {
  const [value, setValue] = useState(0);

  // Estados para Registro
  const [descripcionRegistro, setDescripcionRegistro] = useState('');

  // Estados para Consulta
  const [descripcionBusqueda, setDescripcionBusqueda] = useState('');
  const [codUsuarioBusqueda, setCodUsuarioBusqueda] = useState('');

  // Hook de mantenedor de cajas
  const {
    cajas,
    loading,
    crearCaja,
    buscarCajas
  } = useMantenedorCaja();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Handler para guardar nueva caja
  const handleGuardar = async () => {
    if (!descripcionRegistro.trim()) {
      NotificationService.warning('Por favor ingrese una descripcion');
      return;
    }

    const resultado = await crearCaja({
      descripcion: descripcionRegistro
    });

    if (resultado) {
      // Limpiar formulario
      setDescripcionRegistro('');
    }
  };

  // Handler para limpiar formulario de registro
  const handleNuevoRegistro = () => {
    setDescripcionRegistro('');
  };

  // Handler para buscar cajas
  const handleBuscar = async () => {
    const params: any = {};

    if (descripcionBusqueda) {
      params.descripcion = descripcionBusqueda;
    }

    if (codUsuarioBusqueda) {
      params.codUsuario = Number(codUsuarioBusqueda);
    }

    await buscarCajas(params);
  };

  // Handler para limpiar filtros de busqueda
  const handleNuevoBusqueda = () => {
    setDescripcionBusqueda('');
    setCodUsuarioBusqueda('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="cajas tabs">
            <Tab
              label="Registro Cajas"
              icon={<RegistrationIcon />}
              iconPosition="start"
            />
            <Tab
              label="Consulta Cajas"
              icon={<FindIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab: Registro Cajas */}
        <TabPanel value={value} index={0}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Registro de Cajas
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Descripcion Caja */}
            <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
              <TextField
                label="Descripcion Caja"
                value={descripcionRegistro}
                onChange={(e) => setDescripcionRegistro(e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                placeholder="Ingrese descripcion de la caja"
              />
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleNuevoRegistro}
                disabled={loading}
                size="small"
              >
                Nuevo
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleGuardar}
                disabled={loading}
                size="small"
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab: Consulta Cajas */}
        <TabPanel value={value} index={1}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Consulta de Cajas
          </Typography>

          {/* Filtros de busqueda */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Descripcion */}
            <Box sx={{ flex: '0 1 250px', minWidth: '200px' }}>
              <TextField
                label="Descripcion"
                value={descripcionBusqueda}
                onChange={(e) => setDescripcionBusqueda(e.target.value)}
                size="small"
                fullWidth
                disabled={loading}
                placeholder="Buscar por descripcion"
              />
            </Box>

            {/* Codigo Usuario */}
            <Box sx={{ flex: '0 1 150px', minWidth: '120px' }}>
              <TextField
                label="Cod. Usuario"
                value={codUsuarioBusqueda}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCodUsuarioBusqueda(value);
                }}
                size="small"
                fullWidth
                disabled={loading}
                placeholder="Solo numeros"
                inputProps={{
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
              />
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleBuscar}
                disabled={loading}
                size="small"
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleNuevoBusqueda}
                disabled={loading}
                size="small"
              >
                Nuevo
              </Button>
            </Box>
          </Box>

          {/* Tabla de resultados */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CodCaja</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripcion</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NumCaja</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cajas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No hay resultados. Utilice los filtros para buscar cajas.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cajas.map((caja) => (
                      <TableRow key={caja.codCaja} hover>
                        <TableCell>{caja.codCaja}</TableCell>
                        <TableCell>{caja.descripcion}</TableCell>
                        <TableCell>{caja.usuario || '-'}</TableCell>
                        <TableCell>{caja.numcaja}</TableCell>
                        <TableCell>
                          <Chip
                            label={caja.estado}
                            color={caja.estado === 'DISPONIBLE' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Cajas;
