// src/components/cuenta/CuentaList.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Skeleton,
  Stack,
  InputAdornment,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountIcon,
  Person as PersonIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useCuentas } from '../../hooks/useCuentas';
import { formatCurrency } from '../../utils/formatters';
import { NotificationService } from '../utils/Notification';
import SelectorContribuyente from '../modal/SelectorContribuyente';
import { useDirecciones } from '../../hooks/useDirecciones';

interface CuentaListProps {
  onEdit?: (cuenta: any) => void;
  onDelete?: (codCuenta: number) => void;
  onView?: (cuenta: any) => void;
  showActions?: boolean;
}

const CuentaList: React.FC<CuentaListProps> = ({
  onEdit,
  onDelete,
  onView,
  showActions = true
}) => {
  const theme = useTheme();
  const {
    cuentas,
    loading,
    error,
    cargarTodasCuentas
  } = useCuentas();

  const { direcciones: direccionesData, loading: loadingDirecciones } = useDirecciones();

  // Estados del componente
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Estados para el selector de contribuyente
  const [showContribuyenteSelector, setShowContribuyenteSelector] = useState(false);
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<any>(null);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<any>(null);
  const [predioSeleccionado, setPredioSeleccionado] = useState<string>('');
  const [direccionesContribuyente, setDireccionesContribuyente] = useState<any[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarTodasCuentas();
  }, [cargarTodasCuentas]);

  // Manejar selección de contribuyente
  const handleSelectContribuyente = useCallback((contribuyente: any) => {
    console.log('🔍 [CuentaList] Contribuyente seleccionado:', contribuyente);
    setContribuyenteSeleccionado(contribuyente);
    setShowContribuyenteSelector(false);
    
    // Por ahora, mostrar todas las direcciones disponibles
    // TODO: Implementar filtro por contribuyente cuando exista la relación en la API
    setDireccionesContribuyente(direccionesData);
    
    // Limpiar selecciones previas
    setDireccionSeleccionada(null);
    setPredioSeleccionado('');
  }, [direccionesData]);

  // Manejar selección de dirección
  const handleSelectDireccion = useCallback((direccion: any) => {
    console.log('🏠 [CuentaList] Dirección seleccionada:', direccion);
    setDireccionSeleccionada(direccion);
    setPredioSeleccionado(direccion.codPredio || direccion.codigo || '');
  }, []);

  // Paginar datos
  const cuentasPaginadas = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return cuentas.slice(startIndex, startIndex + rowsPerPage);
  }, [cuentas, page, rowsPerPage]);

  // Manejar búsqueda de cuentas
  const handleBuscar = useCallback(async () => {
    if (!contribuyenteSeleccionado) {
      NotificationService.warning('Debe seleccionar un contribuyente');
      return;
    }

    console.log('🔍 [CuentaList] Buscando cuentas para:', {
      contribuyente: contribuyenteSeleccionado,
      direccion: direccionSeleccionada,
      predio: predioSeleccionado
    });

    // Aquí implementarías la búsqueda real con los datos seleccionados
    await cargarTodasCuentas();
    NotificationService.success('Búsqueda completada');
  }, [contribuyenteSeleccionado, direccionSeleccionada, predioSeleccionado, cargarTodasCuentas]);

  // Manejar eliminaci�n
  const handleDelete = useCallback(async () => {
    if (!cuentaSeleccionada || !onDelete) return;
    
    try {
      await onDelete(cuentaSeleccionada.codCuenta);
      setShowDeleteDialog(false);
      setCuentaSeleccionada(null);
      await cargarTodasCuentas();
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
    }
  }, [cuentaSeleccionada, onDelete, cargarTodasCuentas]);


  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Error al cargar las cuentas: {error}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header con controles de b�squeda */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main'
            }}
          >
            <AccountIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Cuenta Corriente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consulte y gestione las cuentas corrientes del sistema
            </Typography>
          </Box>
        </Stack>

        {/* Controles de búsqueda */}
        <Stack spacing={3}>
          {/* Fila 1: Botón Seleccionar Contribuyente */}
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <Button
              variant="outlined"
              onClick={() => setShowContribuyenteSelector(true)}
              startIcon={<PersonIcon />}
              sx={{ minWidth: 200 }}
            >
              Seleccionar Contribuyente
            </Button>
          </Stack>

          {/* Fila 2: Campos de información del contribuyente */}
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              label="Código Contribuyente"
              value={contribuyenteSeleccionado?.codigo || ''}
              size="small"
              disabled
              sx={{ width: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              label="Nombre Contribuyente"
              value={contribuyenteSeleccionado?.nombre || contribuyenteSeleccionado?.razonSocial || ''}
              size="small"
              disabled
              sx={{ flex: 1, maxWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Autocomplete
              options={direccionesContribuyente}
              value={direccionSeleccionada}
              onChange={(_, newValue) => handleSelectDireccion(newValue)}
              getOptionLabel={(option) => option?.direccionCompleta || option?.descripcion || 'Sin dirección'}
              disabled={!contribuyenteSeleccionado || loadingDirecciones}
              size="small"
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Dirección"
                  placeholder="Seleccione una dirección"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loadingDirecciones ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Stack>

          {/* Fila 3: Código Predio y botón Buscar */}
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              label="Código Predio"
              value={predioSeleccionado}
              size="small"
              disabled
              sx={{ width: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              variant="contained"
              onClick={handleBuscar}
              disabled={loading || !contribuyenteSeleccionado}
              startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Tabla de cuentas */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  N� Cuenta
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  Contribuyente
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  C�digo Predio
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50', textAlign: 'center' }}>
                  A�o
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50', textAlign: 'right' }}>
                  Saldo Actual
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  Estado
                </TableCell>
                {showActions && (
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50', textAlign: 'center' }}>
                    Acciones
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    {showActions && <TableCell><Skeleton variant="text" /></TableCell>}
                  </TableRow>
                ))
              ) : cuentasPaginadas.length > 0 ? (
                cuentasPaginadas.map((cuenta, index) => (
                  <TableRow key={cuenta.codCuenta || index} hover>
                    <TableCell>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {cuenta.numeroCuenta}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cuenta.contribuyente || 'Sin asignar'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cuenta.codPredio}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={cuenta.anio} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        color={cuenta.saldo > 0 ? 'error.main' : 'success.main'}
                      >
                        {formatCurrency(cuenta.saldo || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cuenta.estado || 'Activo'}
                        size="small"
                        color={cuenta.estado === 'Activo' ? 'success' : 'default'}
                        variant="filled"
                      />
                    </TableCell>
                    {showActions && (
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {onView && (
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => onView(cuenta)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Editar cuenta">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEdit(cuenta)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Eliminar cuenta">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setCuentaSeleccionada(cuenta);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} align="center" sx={{ py: 4 }}>
                    <Stack alignItems="center" spacing={2}>
                      <AccountIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                      <Typography variant="h6" color="text.secondary">
                        No se encontraron cuentas
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contribuyenteSeleccionado 
                          ? 'No se encontraron cuentas para este contribuyente' 
                          : 'Seleccione un contribuyente para buscar sus cuentas'}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginaci�n */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={cuentas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por p�gina:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `m�s de ${to}`}`
          }
        />
      </Paper>

      {/* Dialog de confirmaci�n para eliminar */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6">
              Confirmar eliminaci�n
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            �Est� seguro de que desea eliminar la cuenta corriente?
          </Typography>
          {cuentaSeleccionada && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>N� Cuenta:</strong> {cuentaSeleccionada.numeroCuenta}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Contribuyente:</strong> {cuentaSeleccionada.contribuyente}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Saldo:</strong> {formatCurrency(cuentaSeleccionada.saldo || 0)}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta acci�n no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para seleccionar contribuyente */}
      <SelectorContribuyente
        isOpen={showContribuyenteSelector}
        onClose={() => setShowContribuyenteSelector(false)}
        onSelectContribuyente={handleSelectContribuyente}
        title="Seleccionar Contribuyente"
      />
    </Box>
  );
};

export default CuentaList;