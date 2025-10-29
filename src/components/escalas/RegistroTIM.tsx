// src/components/escalas/RegistroTIM.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography
} from '@mui/material';

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

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const timOptions = ['TIM 1', 'TIM 2', 'TIM 3', 'TIM 4', 'TIM 5'];
const resolucionesEjemplo = ['O.M. 001-2025-MDE', 'O.M. 002-2025-MDE', 'O.M. 003-2025-MDE'];

// Datos de ejemplo para la tabla
const datosEjemplo = [
  { id: 1, anio: 2025, tasa: 0.8, periodo: 'Enero', tributo: 'TIM 1', resolucion: 'O.M. 001-2025-MDE' },
  { id: 2, anio: 2025, tasa: 0.75, periodo: 'Febrero', tributo: 'TIM 2', resolucion: 'O.M. 002-2025-MDE' },
  { id: 3, anio: 2024, tasa: 0.85, periodo: 'Diciembre', tributo: 'TIM 3', resolucion: 'O.M. 003-2025-MDE' },
];

export const RegistroTIM: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [tasa, setTasa] = useState<string>('');
  const [tim, setTim] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<string>('Enero');
  const [resolucion, setResolucion] = useState<string | null>(null);

  // Estados para búsqueda
  const [busquedaAnio, setBusquedaAnio] = useState<number>(new Date().getFullYear());
  const [busquedaResolucion, setBusquedaResolucion] = useState<string | null>(null);
  const [resultados, setResultados] = useState(datosEjemplo);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGuardar = () => {
    console.log('Guardando:', { anio, tasa, tim, periodo, resolucion });
    // Aquí iría la lógica de guardado
  };

  const handleNuevo = () => {
    setAnio(new Date().getFullYear());
    setTasa('');
    setTim(null);
    setPeriodo('Enero');
    setResolucion(null);
  };

  const handleBuscar = () => {
    console.log('Buscando:', { busquedaAnio, busquedaResolucion });
    // Aquí iría la lógica de búsqueda
    // Por ahora mostramos los datos de ejemplo
    setResultados(datosEjemplo);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Formulario TIM" />
          <Tab label="Búsqueda TIM" />
        </Tabs>
      </Box>

      {/* TAB 1: Formulario TIM */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          {/* Primera fila */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Año"
              type="number"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value) || new Date().getFullYear())}
              sx={{ width: 100 }}
              size="small"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            />
            <TextField
              label="Tasa"
              type="number"
              value={tasa}
              onChange={(e) => setTasa(e.target.value)}
              sx={{ width: 100 }}
              size="small"
              InputProps={{ inputProps: { step: 0.01, min: 0 } }}
              placeholder="0.00"
            />
            <Autocomplete
              value={tim}
              onChange={(_event, newValue) => setTim(newValue)}
              options={timOptions}
              sx={{ width: 120 }}
              size="small"
              renderInput={(params) => <TextField {...params} label="TIM" />}
            />
            <Autocomplete
              value={periodo}
              onChange={(_event, newValue) => setPeriodo(newValue || 'Enero')}
              options={meses}
              sx={{ width: 140 }}
              size="small"
              renderInput={(params) => <TextField {...params} label="Periodo" />}
            />
            <Autocomplete
              value={resolucion}
              onChange={(_event, newValue) => setResolucion(newValue)}
              options={resolucionesEjemplo}
              sx={{ width: 250 }}
              size="small"
              freeSolo
              renderInput={(params) => <TextField {...params} label="Resolución" />}
            />
          </Stack>

          {/* Segunda fila */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardar}
              sx={{ minWidth: 120, height: 40 }}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleNuevo}
              sx={{ minWidth: 120, height: 40 }}
            >
              Nuevo
            </Button>
          </Stack>
        </Stack>
      </TabPanel>

      {/* TAB 2: Búsqueda TIM */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          {/* Filtros de búsqueda */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Autocomplete
              value={busquedaResolucion}
              onChange={(_event, newValue) => setBusquedaResolucion(newValue)}
              options={resolucionesEjemplo}
              sx={{ width: 250 }}
              size="small"
              freeSolo
              renderInput={(params) => <TextField {...params} label="Resolución" />}
            />
            <TextField
              label="Año"
              type="number"
              value={busquedaAnio}
              onChange={(e) => setBusquedaAnio(parseInt(e.target.value) || new Date().getFullYear())}
              sx={{ width: 100 }}
              size="small"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            />
            <Button variant="contained" color="primary" onClick={handleBuscar}>
              Buscar
            </Button>
          </Stack>

          {/* Tabla de resultados */}
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 400,
              overflowX: 'auto',
              overflowY: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">Año</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Tasa</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Periodo</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Tributo</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Resolución</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.length > 0 ? (
                  resultados.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.anio}</TableCell>
                      <TableCell>{row.tasa}</TableCell>
                      <TableCell>{row.periodo}</TableCell>
                      <TableCell>{row.tributo}</TableCell>
                      <TableCell>{row.resolucion}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No se encontraron resultados</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </TabPanel>
    </Paper>
  );
};

export default RegistroTIM;
