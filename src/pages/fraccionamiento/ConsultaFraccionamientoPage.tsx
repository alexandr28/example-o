// src/pages/fraccionamiento/ConsultaFraccionamientoPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MainLayout from '../../layout/MainLayout';
import { useFraccionamiento } from '../../hooks/useFraccionamiento';
import type { Fraccionamiento, EstadoFraccionamiento } from '../../types/fraccionamiento.types';
import { useNavigate } from 'react-router-dom';

// Datos de ejemplo
const fraccionamientosEjemplo: Fraccionamiento[] = [
  {
    id: 1,
    codigoFraccionamiento: 'FRAC-2024-001',
    codigoContribuyente: 'CONT-001',
    nombreContribuyente: 'Juan Pérez García',
    fechaSolicitud: '2024-10-15',
    fechaAprobacion: '2024-10-18',
    montoTotal: 4329.00,
    montoCuotaInicial: 500.00,
    numeroCuotas: 12,
    montoCuota: 329.08,
    tasaInteres: 1.5,
    estado: 'VIGENTE',
    aprobadoPor: 'Admin Sistema'
  },
  {
    id: 2,
    codigoFraccionamiento: 'FRAC-2024-002',
    codigoContribuyente: 'CONT-002',
    nombreContribuyente: 'María López Sánchez',
    fechaSolicitud: '2024-10-20',
    montoTotal: 3280.00,
    montoCuotaInicial: 500.00,
    numeroCuotas: 18,
    montoCuota: 162.22,
    tasaInteres: 1.5,
    estado: 'PENDIENTE'
  },
  {
    id: 3,
    codigoFraccionamiento: 'FRAC-2024-003',
    codigoContribuyente: 'CONT-003',
    nombreContribuyente: 'Carlos Rodríguez Díaz',
    fechaSolicitud: '2024-10-22',
    fechaAprobacion: '2024-10-25',
    montoTotal: 5650.00,
    montoCuotaInicial: 1000.00,
    numeroCuotas: 24,
    montoCuota: 203.54,
    tasaInteres: 1.5,
    estado: 'VIGENTE',
    aprobadoPor: 'Admin Sistema'
  },
  {
    id: 4,
    codigoFraccionamiento: 'FRAC-2024-004',
    codigoContribuyente: 'CONT-004',
    nombreContribuyente: 'Ana Martínez Torres',
    fechaSolicitud: '2024-10-18',
    montoTotal: 2150.00,
    montoCuotaInicial: 500.00,
    numeroCuotas: 6,
    montoCuota: 282.50,
    tasaInteres: 1.5,
    estado: 'RECHAZADO',
    motivoRechazo: 'Deuda menor al mínimo requerido'
  },
  {
    id: 5,
    codigoFraccionamiento: 'FRAC-2024-005',
    codigoContribuyente: 'CONT-005',
    nombreContribuyente: 'Luis Torres Vega',
    fechaSolicitud: '2024-09-10',
    fechaAprobacion: '2024-09-15',
    montoTotal: 7890.00,
    montoCuotaInicial: 1500.00,
    numeroCuotas: 12,
    montoCuota: 548.25,
    tasaInteres: 1.5,
    estado: 'CANCELADO',
    aprobadoPor: 'Admin Sistema'
  }
];

const ConsultaFraccionamientoPage: React.FC = () => {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    codigo: '',
    codigoContribuyente: '',
    nombreContribuyente: '',
    estado: '' as EstadoFraccionamiento | '',
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null
  });

  const [fraccionamientos, setFraccionamientos] = useState<Fraccionamiento[]>(fraccionamientosEjemplo);
  const [fraccionamientoSeleccionado, setFraccionamientoSeleccionado] = useState<Fraccionamiento | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { cancelarFraccionamiento, cargando } = useFraccionamiento();

  const handleBuscar = useCallback(() => {
    // Aquí se aplicarían los filtros reales
    let resultados = fraccionamientosEjemplo;

    if (filtros.codigo) {
      resultados = resultados.filter(f =>
        f.codigoFraccionamiento?.toLowerCase().includes(filtros.codigo.toLowerCase())
      );
    }

    if (filtros.codigoContribuyente) {
      resultados = resultados.filter(f =>
        f.codigoContribuyente.toLowerCase().includes(filtros.codigoContribuyente.toLowerCase())
      );
    }

    if (filtros.nombreContribuyente) {
      resultados = resultados.filter(f =>
        f.nombreContribuyente?.toLowerCase().includes(filtros.nombreContribuyente.toLowerCase())
      );
    }

    if (filtros.estado) {
      resultados = resultados.filter(f => f.estado === filtros.estado);
    }

    setFraccionamientos(resultados);
    setPage(0);
  }, [filtros]);

  const handleLimpiar = useCallback(() => {
    setFiltros({
      codigo: '',
      codigoContribuyente: '',
      nombreContribuyente: '',
      estado: '',
      fechaDesde: null,
      fechaHasta: null
    });
    setFraccionamientos(fraccionamientosEjemplo);
  }, []);

  const handleVerDetalle = useCallback((fraccionamiento: Fraccionamiento) => {
    setFraccionamientoSeleccionado(fraccionamiento);
    setModalDetalle(true);
  }, []);

  const handleCancelar = useCallback((fraccionamiento: Fraccionamiento) => {
    setFraccionamientoSeleccionado(fraccionamiento);
    setModalCancelar(true);
  }, []);

  const handleConfirmarCancelacion = useCallback(async () => {
    if (fraccionamientoSeleccionado && fraccionamientoSeleccionado.id) {
      const exito = await cancelarFraccionamiento(fraccionamientoSeleccionado.id, motivoCancelacion);
      if (exito) {
        setModalCancelar(false);
        setMotivoCancelacion('');
        handleBuscar();
      }
    }
  }, [fraccionamientoSeleccionado, motivoCancelacion, cancelarFraccionamiento, handleBuscar]);

  const handleVerCronograma = useCallback((fraccionamiento: Fraccionamiento) => {
    navigate(`/fraccionamiento/cronograma/${fraccionamiento.id}`);
  }, [navigate]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
      case 'APROBADO':
      case 'VIGENTE':
        return 'success';
      case 'RECHAZADO':
        return 'error';
      case 'CANCELADO':
        return 'default';
      case 'VENCIDO':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Estadísticas
  const estadisticas = {
    total: fraccionamientos.length,
    pendientes: fraccionamientos.filter(f => f.estado === 'PENDIENTE').length,
    vigentes: fraccionamientos.filter(f => f.estado === 'VIGENTE').length,
    rechazados: fraccionamientos.filter(f => f.estado === 'RECHAZADO').length
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Consulta de Fraccionamientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busque y gestione las solicitudes de fraccionamiento
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            gap: 0,
            mb: 3,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              px: 2,
              textAlign: 'center',
              borderRight: 1,
              borderColor: 'divider',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Total
            </Typography>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {estadisticas.total}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              px: 2,
              textAlign: 'center',
              borderRight: 1,
              borderColor: 'divider',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Pendientes
            </Typography>
            <Typography variant="h6" fontWeight={600} color="warning.main">
              {estadisticas.pendientes}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              px: 2,
              textAlign: 'center',
              borderRight: 1,
              borderColor: 'divider',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Vigentes
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              {estadisticas.vigentes}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              px: 2,
              textAlign: 'center',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Rechazados
            </Typography>
            <Typography variant="h6" fontWeight={600} color="error.main">
              {estadisticas.rechazados}
            </Typography>
          </Box>
        </Paper>

        {/* Filtros */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6">Filtros de Búsqueda</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Código Fraccionamiento"
                size="small"
                value={filtros.codigo}
                onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Código Contribuyente"
                size="small"
                value={filtros.codigoContribuyente}
                onChange={(e) => setFiltros({ ...filtros, codigoContribuyente: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Nombre Contribuyente"
                size="small"
                value={filtros.nombreContribuyente}
                onChange={(e) => setFiltros({ ...filtros, nombreContribuyente: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <TextField
                select
                fullWidth
                label="Estado"
                size="small"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoFraccionamiento })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                <MenuItem value="APROBADO">Aprobado</MenuItem>
                <MenuItem value="RECHAZADO">Rechazado</MenuItem>
                <MenuItem value="VIGENTE">Vigente</MenuItem>
                <MenuItem value="CANCELADO">Cancelado</MenuItem>
                <MenuItem value="VENCIDO">Vencido</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <DatePicker
                label="Fecha Desde"
                value={filtros.fechaDesde}
                onChange={(newValue) => setFiltros({ ...filtros, fechaDesde: newValue })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <DatePicker
                label="Fecha Hasta"
                value={filtros.fechaHasta}
                onChange={(newValue) => setFiltros({ ...filtros, fechaHasta: newValue })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleBuscar}
                sx={{ height: 40 }}
              >
                Buscar
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleLimpiar}
                sx={{ height: 40 }}
              >
                Limpiar
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Tabla de resultados */}
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Código</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contribuyente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha Solicitud</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Monto Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Cuotas</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Cuota Mensual</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fraccionamientos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((frac) => (
                    <TableRow key={frac.id} hover>
                      <TableCell>{frac.codigoFraccionamiento}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{frac.nombreContribuyente}</Typography>
                        <Typography variant="caption" color="text.secondary">{frac.codigoContribuyente}</Typography>
                      </TableCell>
                      <TableCell>{new Date(frac.fechaSolicitud).toLocaleDateString('es-PE')}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>S/ {frac.montoTotal.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={frac.numeroCuotas} size="small" />
                      </TableCell>
                      <TableCell align="right">S/ {frac.montoCuota.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={frac.estado}
                          color={getEstadoColor(frac.estado) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleVerDetalle(frac)}
                            title="Ver detalle"
                          >
                            <ViewIcon />
                          </IconButton>
                          {frac.estado === 'VIGENTE' && (
                            <>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleVerCronograma(frac)}
                                title="Ver cronograma"
                              >
                                <AssessmentIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelar(frac)}
                                title="Cancelar"
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={fraccionamientos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
          />
        </Paper>

        {/* Modal de detalle */}
        <Dialog open={modalDetalle} onClose={() => setModalDetalle(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Detalle del Fraccionamiento
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {fraccionamientoSeleccionado && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {fraccionamientoSeleccionado.codigoFraccionamiento}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Contribuyente:</Typography>
                    <Typography variant="body1" fontWeight={600}>{fraccionamientoSeleccionado.nombreContribuyente}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Código:</Typography>
                    <Typography variant="body1" fontWeight={600}>{fraccionamientoSeleccionado.codigoContribuyente}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Fecha Solicitud:</Typography>
                    <Typography variant="body1">{new Date(fraccionamientoSeleccionado.fechaSolicitud).toLocaleDateString('es-PE')}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Fecha Aprobación:</Typography>
                    <Typography variant="body1">
                      {fraccionamientoSeleccionado.fechaAprobacion
                        ? new Date(fraccionamientoSeleccionado.fechaAprobacion).toLocaleDateString('es-PE')
                        : '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Monto Total:</Typography>
                    <Typography variant="h6" color="primary">S/ {fraccionamientoSeleccionado.montoTotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Cuota Inicial:</Typography>
                    <Typography variant="h6" color="warning.main">S/ {fraccionamientoSeleccionado.montoCuotaInicial.toFixed(2)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Número de Cuotas:</Typography>
                    <Typography variant="body1">{fraccionamientoSeleccionado.numeroCuotas} meses</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Tasa de Interés:</Typography>
                    <Typography variant="body1">{fraccionamientoSeleccionado.tasaInteres}% anual</Typography>
                  </Box>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>Cuota Mensual:</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                    S/ {fraccionamientoSeleccionado.montoCuota.toFixed(2)}
                  </Typography>
                </Paper>
                <Box>
                  <Typography variant="caption" color="text.secondary">Estado:</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={fraccionamientoSeleccionado.estado}
                      color={getEstadoColor(fraccionamientoSeleccionado.estado) as any}
                    />
                  </Box>
                </Box>
                {fraccionamientoSeleccionado.aprobadoPor && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Aprobado por:</Typography>
                    <Typography variant="body1">{fraccionamientoSeleccionado.aprobadoPor}</Typography>
                  </Box>
                )}
                {fraccionamientoSeleccionado.motivoRechazo && (
                  <Alert severity="error">
                    <strong>Motivo de Rechazo:</strong> {fraccionamientoSeleccionado.motivoRechazo}
                  </Alert>
                )}
                {fraccionamientoSeleccionado.observaciones && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Observaciones:</Typography>
                    <Typography variant="body2">{fraccionamientoSeleccionado.observaciones}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalDetalle(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Modal de cancelación */}
        <Dialog open={modalCancelar} onClose={() => setModalCancelar(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
            Cancelar Fraccionamiento
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta acción cancelará el fraccionamiento. ¿Está seguro?
            </Alert>
            {fraccionamientoSeleccionado && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Código:</Typography>
                <Typography variant="h6">{fraccionamientoSeleccionado.codigoFraccionamiento}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Contribuyente:</Typography>
                <Typography variant="body1">{fraccionamientoSeleccionado.nombreContribuyente}</Typography>
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo de Cancelación"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Ingrese el motivo de la cancelación..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalCancelar(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmarCancelacion}
              disabled={!motivoCancelacion || cargando}
            >
              Confirmar Cancelación
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default ConsultaFraccionamientoPage;
