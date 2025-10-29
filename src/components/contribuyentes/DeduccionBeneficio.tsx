// src/components/contribuyentes/DeduccionBeneficio.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
  Alert
} from '@mui/material';
import SelectorContribuyente from '../modal/SelectorContribuyente';

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

interface PredioData {
  codigoPredio: string;
  direccionCompleta: string;
}

interface ContribuyenteSeleccionado {
  codigoContribuyente: string;
  nombreCompleto: string;
  edad?: number;
}

interface ConsultaBeneficio {
  codigoContribuyente: string;
  nombreContribuyente: string;
  estado: string;
}

export const DeduccionBeneficio: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Estados para Tab 1: Registro Deducciones
  const [modalOpen, setModalOpen] = useState(false);
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<ContribuyenteSeleccionado | null>(null);
  const [nombrePensionista, setNombrePensionista] = useState<string>('');
  const [predios, setPredios] = useState<PredioData[]>([]);
  const [mostrarPredios, setMostrarPredios] = useState(false);

  // Estados para Tab 2: Consulta Pensionista
  const [codigoBusqueda, setCodigoBusqueda] = useState<string>('');
  const [resultadosConsulta, setResultadosConsulta] = useState<ConsultaBeneficio[]>([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSeleccionarContribuyente = useCallback((contribuyente: any) => {
    // El modal devuelve: { codigo, contribuyente (nombre completo), documento, direccion, telefono, tipoPersona }
    console.log('📋 Contribuyente seleccionado:', contribuyente);

    const nombreCompleto = contribuyente.contribuyente || '';
    const codigoContribuyente = contribuyente.codigo?.toString() || '';

    setContribuyenteSeleccionado({
      codigoContribuyente,
      nombreCompleto,
      edad: contribuyente.edad
    });
    setNombrePensionista(nombreCompleto);
    setModalOpen(false);
  }, []);

  const handleBuscarPredios = useCallback(() => {
    // Aqu� ir�a la l�gica para buscar los predios del contribuyente
    // Por ahora, simulo datos de ejemplo
    if (contribuyenteSeleccionado) {
      const prediosEjemplo: PredioData[] = [
        {
          codigoPredio: 'P-001',
          direccionCompleta: 'Av. Principal 123, Distrito Lima'
        }
        // Agregar m�s predios si es necesario para probar la validaci�n
      ];
      setPredios(prediosEjemplo);
      setMostrarPredios(true);
    }
  }, [contribuyenteSeleccionado]);

  const aplicaBeneficio = useMemo((): boolean => {
    return predios.length === 1;
  }, [predios.length]);

  const handleAsignacionPensionista = useCallback(() => {
    if (!aplicaBeneficio) {
      alert('No aplica al beneficio. El contribuyente debe tener exactamente un predio.');
      return;
    }
    // L�gica para asignar beneficio de pensionista
    console.log('Asignando beneficio de pensionista...');
    alert('Beneficio de Pensionista asignado correctamente');
  }, [aplicaBeneficio]);

  const handleAdultoMayor = useCallback(() => {
    if (!aplicaBeneficio) {
      alert('No aplica al beneficio. El contribuyente debe tener exactamente un predio.');
      return;
    }

    if (!contribuyenteSeleccionado?.edad || contribuyenteSeleccionado.edad < 60) {
      alert('No aplica al beneficio de Adulto Mayor. Debe tener m�s de 60 a�os.');
      return;
    }

    // L�gica para asignar beneficio de adulto mayor
    console.log('Asignando beneficio de adulto mayor...');
    alert('Beneficio de Adulto Mayor asignado correctamente');
  }, [aplicaBeneficio, contribuyenteSeleccionado?.edad]);

  const handleBuscarBeneficio = useCallback(() => {
    // Aqu� ir�a la l�gica para buscar beneficios del contribuyente
    // Por ahora, simulo una b�squeda sin resultados
    setBusquedaRealizada(true);

    // Simulaci�n: si el c�digo no est� vac�o, mostrar resultado de ejemplo
    if (codigoBusqueda.trim() !== '') {
      // Ejemplo con resultado
      const resultadosEjemplo: ConsultaBeneficio[] = [
        {
          codigoContribuyente: codigoBusqueda,
          nombreContribuyente: 'Juan P�rez Garc�a',
          estado: 'ACTIVO'
        }
      ];
      setResultadosConsulta(resultadosEjemplo);
    } else {
      setResultadosConsulta([]);
    }
  }, [codigoBusqueda]);

  const handleLimpiarConsulta = useCallback(() => {
    setCodigoBusqueda('');
    setResultadosConsulta([]);
    setBusquedaRealizada(false);
  }, []);

  const handleNuevo = useCallback(() => {
    setContribuyenteSeleccionado(null);
    setNombrePensionista('');
    setPredios([]);
    setMostrarPredios(false);
  }, []);

  return (
    <>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 1200 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Registro Deducciones" />
            <Tab label="Consulta Pensionista / Adulto Mayor" />
          </Tabs>
        </Box>

        {/* TAB 1: Registro Deducciones */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            {/* Filtro - Seleccionar Contribuyente */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{ minWidth: 200 }}
              >
                Seleccionar Contribuyente
              </Button>
              <TextField
                label="Contribuyente"
                value={nombrePensionista}
                sx={{ flex: 1, minWidth: 300 }}
                size="small"
                disabled
                placeholder="Seleccione un contribuyente..."
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBuscarPredios}
                disabled={!contribuyenteSeleccionado}
                sx={{ minWidth: 120 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleNuevo}
                sx={{ minWidth: 120 }}
              >
                Nuevo
              </Button>
            </Stack>

            {/* Tabla de Predios */}
            {mostrarPredios && (
              <>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 400,
                    overflowX: 'auto',
                    overflowY: 'auto'
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                          Codigo Predio
                        </TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                          Direccion Completa
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {predios.length > 0 ? (
                        predios.map((predio, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{predio.codigoPredio}</TableCell>
                            <TableCell>{predio.direccionCompleta}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              No se encontraron predios para este contribuyente
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Mensaje informativo sobre aplicaci�n del beneficio */}
                <Alert severity={aplicaBeneficio ? 'success' : 'warning'} sx={{ mt: 2 }}>
                  {aplicaBeneficio ? (
                    <Typography>
                      <strong>SI APLICA AL BENEFICIO:</strong> El contribuyente tiene un solo predio registrado.
                    </Typography>
                  ) : (
                    <Typography>
                      <strong>NO APLICA AL BENEFICIO:</strong> El contribuyente tiene {predios.length} predio(s) registrado(s).
                      Para aplicar al beneficio debe tener exactamente un predio.
                    </Typography>
                  )}
                </Alert>

                {/* Botones de asignaci�n de beneficios */}
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAsignacionPensionista}
                    disabled={!aplicaBeneficio}
                    sx={{ minWidth: 200, height: 45 }}
                  >
                    Asignacion Pensionista
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAdultoMayor}
                    disabled={!aplicaBeneficio}
                    sx={{ minWidth: 200, height: 45 }}
                  >
                    Adulto Mayor
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </TabPanel>

        {/* TAB 2: Consulta Pensionista / Adulto Mayor */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            {/* Filtros de b�squeda */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Codigo Contribuyente"
                value={codigoBusqueda}
                onChange={(e) => setCodigoBusqueda(e.target.value)}
                sx={{ width: 250 }}
                size="small"
                placeholder="Ingrese codigo..."
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleBuscarBeneficio}
                disabled={!codigoBusqueda.trim()}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleLimpiarConsulta}
              >
                Limpiar
              </Button>
            </Stack>

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
                      Codigo Contribuyente
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      Nombre Contribuyente
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      Estado
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultadosConsulta.length > 0 ? (
                    resultadosConsulta.map((beneficio, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{beneficio.codigoContribuyente}</TableCell>
                        <TableCell>{beneficio.nombreContribuyente}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: beneficio.estado === 'ACTIVO' ? 'success.lighter' : 'error.lighter',
                              color: beneficio.estado === 'ACTIVO' ? 'success.dark' : 'error.dark',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {beneficio.estado}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {busquedaRealizada
                            ? 'El contribuyente no cuenta con ningun beneficio'
                            : 'Ingrese un codigo de contribuyente y haga clic en Buscar'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Resumen */}
            {resultadosConsulta.length > 0 && (
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Beneficio encontrado:</strong> {resultadosConsulta.length} registro(s)
                </Typography>
              </Box>
            )}
          </Stack>
        </TabPanel>
      </Paper>

      {/* Modal de Selecci�n de Contribuyente */}
      <SelectorContribuyente
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSelectContribuyente={handleSeleccionarContribuyente}
      />
    </>
  );
};

export default DeduccionBeneficio;
