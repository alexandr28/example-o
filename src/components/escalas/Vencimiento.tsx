// src/components/escalas/Vencimiento.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  useVencimientosPorAnio,
  useCreateVencimientos
} from '../../hooks/useVencimientos';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Vencimiento: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Estados para formulario
  const [anioFormulario, setAnioFormulario] = useState<number>(new Date().getFullYear());

  // Estados para busqueda
  const [anioBusqueda, setAnioBusqueda] = useState<number>(new Date().getFullYear());
  const [anioBusquedaActual, setAnioBusquedaActual] = useState<number>(new Date().getFullYear());
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  // Hooks
  const { mutate: crearVencimientos, loading: loadingCrear, error: errorCrear } = useCreateVencimientos();
  const { data: vencimientos, loading: loadingBusqueda, error: errorBusqueda, refetch } = useVencimientosPorAnio(
    anioBusquedaActual,
    shouldFetch
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Si cambiamos al tab de consulta, habilitar la carga de datos
    if (newValue === 1) {
      setShouldFetch(true);
    } else {
      setShouldFetch(false);
    }
  };

  const handleGuardar = async () => {
    if (!anioFormulario) {
      return;
    }

    const resultado = await crearVencimientos({ anio: anioFormulario });

    if (resultado) {
      // Si estamos en el tab de busqueda y el anio coincide, recargar
      if (tabValue === 1 && anioBusquedaActual === anioFormulario) {
        setShouldFetch(true);
        refetch();
      }
    }
  };

  const handleNuevo = () => {
    setAnioFormulario(new Date().getFullYear());
  };

  const handleBuscar = () => {
    setAnioBusquedaActual(anioBusqueda);
    setShouldFetch(true);
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', maxWidth: 1200 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Generar Vencimientos" />
          <Tab label="Consultar Vencimientos" />
        </Tabs>
      </Box>

      {/* TAB 1: Formulario Generar Vencimientos */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          {/* Formulario */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Anio Fiscal"
              type="number"
              value={anioFormulario}
              onChange={(e) => setAnioFormulario(parseInt(e.target.value) || new Date().getFullYear())}
              sx={{ width: 150 }}
              size="small"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Generar vencimientos para el anio fiscal seleccionado
            </Typography>
          </Stack>

          {/* Mensajes de error */}
          {errorCrear && (
            <Alert severity="error">
              {errorCrear}
            </Alert>
          )}

          {/* Botones */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start">
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardar}
              disabled={loadingCrear || !anioFormulario}
              sx={{ minWidth: 140, height: 40 }}
              startIcon={loadingCrear ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loadingCrear ? 'Generando...' : 'Generar Vencimientos'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleNuevo}
              disabled={loadingCrear}
              sx={{ minWidth: 120, height: 40 }}
            >
              Nuevo
            </Button>
          </Stack>

          {/* Informacion */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Nota:</strong> Esta accion generara automaticamente los vencimientos mensuales
              para el anio fiscal seleccionado, calculando los ultimos dias habiles de cada mes
              para los diferentes tipos de impuestos (Arbitrial, Predial, etc.).
            </Typography>
          </Box>
        </Stack>
      </TabPanel>

      {/* TAB 2: Busqueda/Consulta de Vencimientos */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          {/* Filtros de busqueda */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Anio Fiscal"
              type="number"
              value={anioBusqueda}
              onChange={(e) => setAnioBusqueda(parseInt(e.target.value) || new Date().getFullYear())}
              sx={{ width: 150 }}
              size="small"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleBuscar}
              disabled={loadingBusqueda}
            >
              Buscar
            </Button>
            {loadingBusqueda && <CircularProgress size={24} />}
          </Stack>

          {/* Mensajes de error */}
          {errorBusqueda && (
            <Alert severity="error">
              {errorBusqueda}
            </Alert>
          )}

          {/* Tabla de resultados */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: 500,
              overflowX: 'auto',
              overflowY: 'auto'
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Anio
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Mes
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Tipo Impuesto
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Dia Semana
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Ultimo Dia Habil
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingBusqueda && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                )}

                {!loadingBusqueda && vencimientos && vencimientos.length > 0 && (
                  vencimientos.map((vencimiento, index) => (
                    <TableRow key={`venc-${index}-${vencimiento.anio}-${vencimiento.mes}`} hover>
                      <TableCell>{vencimiento.anio}</TableCell>
                      <TableCell>{vencimiento.mes}</TableCell>
                      <TableCell>{vencimiento.tipoImpuesto}</TableCell>
                      <TableCell>{vencimiento.diaSemana}</TableCell>
                      <TableCell>{vencimiento.ultimoDiaHabilStr}</TableCell>
                    </TableRow>
                  ))
                )}

                {!loadingBusqueda && (!vencimientos || vencimientos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No se encontraron vencimientos para el anio {anioBusquedaActual}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumen */}
          {vencimientos.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Total de registros:</strong> {vencimientos.length} vencimientos encontrados
              </Typography>
            </Box>
          )}
        </Stack>
      </TabPanel>
    </Paper>
  );
};

export default Vencimiento;
