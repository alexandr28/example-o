// src/components/contribuyentes/ContribuyenteConsulta.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
  Chip,
  useTheme,
  Tooltip,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
  Skeleton,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Info as InfoIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import constanteService, { ConstanteData } from '../../services/constanteService';
import { NotificationService } from '../utils/Notification';

interface Contribuyente {
  codigo: string | number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica' | string;
  estado?: 'activo' | 'inactivo';
}

interface ContribuyenteConsultaProps {
  contribuyentes: Contribuyente[];
  onBuscar: (filtro: any) => void;
  onNuevo?: () => void;
  onEditar: (codigo: string | number) => void;
  onVer?: (codigo: string | number) => void;
  loading?: boolean;
}

const ContribuyenteConsulta: React.FC<ContribuyenteConsultaProps> = ({
  contribuyentes,
  onBuscar,
  onNuevo,
  onEditar,
  onVer,
  loading = false
}) => {
  const theme = useTheme();
  
  // Estados del formulario de filtro
  const [tipoContribuyente, setTipoContribuyente] = useState<any>(null);
  const [tipoDocumento, setTipoDocumento] = useState<any>(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para las opciones cargadas desde la API
  const [tipoContribuyenteOptions, setTipoContribuyenteOptions] = useState<any[]>([]);
  const [tipoDocumentoOptions, setTipoDocumentoOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Estados para la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContribuyente, setSelectedContribuyente] = useState<Contribuyente | null>(null);

  // Cargar opciones desde la API al montar el componente
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setLoadingOptions(true);
        
        // Cargar tipos de contribuyente
        const tiposContribuyente = await constanteService.obtenerTiposContribuyente();
        const tiposContribuyenteOptions = tiposContribuyente.map((tipo: ConstanteData) => ({
          id: tipo.codConstante,
          value: tipo.codConstante,
          label: tipo.nombreCategoria,
          description: tipo.nombreCategoria
        }));
        setTipoContribuyenteOptions(tiposContribuyenteOptions);
        
        // Cargar tipos de documento
        const tiposDocumento = await constanteService.obtenerTiposDocumento();
        const tiposDocumentoOptions = tiposDocumento.map((tipo: ConstanteData) => ({
          id: tipo.codConstante,
          value: tipo.codConstante,
          label: tipo.nombreCategoria,
          description: tipo.nombreCategoria
        }));
        setTipoDocumentoOptions(tiposDocumentoOptions);
        
      } catch (error) {
        console.error('Error cargando opciones:', error);
        NotificationService.show('Error al cargar las opciones de filtro', 'error');
      } finally {
        setLoadingOptions(false);
      }
    };

    cargarOpciones();
  }, []);

  // Manejo de la búsqueda
  const handleBuscar = () => {
    const filtro = {
      tipoContribuyente: tipoContribuyente?.value || null,
      tipoDocumento: tipoDocumento?.value || null,
      busqueda: busqueda.trim() || null
    };
    
    console.log('🔍 Buscando con filtro:', filtro);
    onBuscar(filtro);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setTipoContribuyente(null);
    setTipoDocumento(null);
    setBusqueda('');
    
    // Buscar sin filtros
    onBuscar({
      tipoContribuyente: null,
      tipoDocumento: null,
      busqueda: null
    });
  };

  // Determinar si hay filtros activos
  const tieneFiltrosActivos = tipoContribuyente || tipoDocumento || busqueda.trim();

  // Manejo de la tabla
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, contribuyente: Contribuyente) => {
    setAnchorEl(event.currentTarget);
    setSelectedContribuyente(contribuyente);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContribuyente(null);
  };

  const handleEditar = () => {
    if (selectedContribuyente) {
      onEditar(selectedContribuyente.codigo);
      handleMenuClose();
    }
  };

  const handleVer = () => {
    if (selectedContribuyente && onVer) {
      onVer(selectedContribuyente.codigo);
      handleMenuClose();
    }
  };

  // Obtener tipo de persona
  const getTipoPersonaIcon = (tipoPersona?: string) => {
    return tipoPersona === 'juridica' ? <BusinessIcon /> : <PersonIcon />;
  };

  const getTipoPersonaColor = (tipoPersona?: string) => {
    return tipoPersona === 'juridica' ? 'primary' : 'secondary';
  };

  // Datos paginados
  const contribuyentesPaginados = contribuyentes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Stack spacing={3}>
      {/* Sección de Filtros */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FilterIcon />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Filtros de Búsqueda
          </Typography>
          {tieneFiltrosActivos && (
            <Chip 
              label="Filtros aplicados" 
              color="primary" 
              size="small"
              icon={<InfoIcon />}
            />
          )}
        </Box>

        <Stack spacing={3}>
          {/* Primera fila: Selectores */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {/* Tipo de Contribuyente */}
            <Box sx={{ flex: '0 0 100px', minWidth: '130px' }}>
              <Autocomplete
                options={tipoContribuyenteOptions}
                getOptionKey={(option) => `tipo-contribuyente-${option.id}`}
                getOptionLabel={(option) => option.label}
                value={tipoContribuyente}
                onChange={(_, newValue) => setTipoContribuyente(newValue)}
                disabled={loadingOptions}
                loading={loadingOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="TipoContribuyente"
                    placeholder="Seleccione tipo"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccountBalanceIcon fontSize="small" color="action" />
                      <Typography variant="body2">{option.label}</Typography>
                    </Stack>
                  </Box>
                )}
              />
            </Box>

            {/* Tipo de Documento */}
            <Box sx={{ flex: '0 0 130px', minWidth: '120px' }}>
              <Autocomplete
                options={tipoDocumentoOptions}
                getOptionKey={(option) => `tipo-documento-${option.id}`}
                getOptionLabel={(option) => option.label}
                value={tipoDocumento}
                onChange={(_, newValue) => setTipoDocumento(newValue)}
                disabled={loadingOptions}
                loading={loadingOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="TipoDocumento"
                    placeholder="Seleccione tipo"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BadgeIcon fontSize="small" color="action" />
                      <Typography variant="body2">{option.label}</Typography>
                    </Stack>
                  </Box>
                )}
              />
            </Box>
             {/* Campo de búsqueda */}
             <Box sx={{ flex: '0 0 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Buscar contribuyente"
                placeholder="Ingrese nombre, documento o dirección..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                disabled={loading}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: busqueda && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setBusqueda('')}
                        disabled={loading}
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBuscar();
                  }
                }}
              />
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                sx={{ minWidth: '100px', maxHeight:'33px' }}
              >
                Buscar
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleLimpiar}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{ maxHeight:'33px'}}
              >
                Limpiar
              </Button>

              {onNuevo && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={onNuevo}
                  startIcon={<PersonAddIcon />}
                  sx={{ ml: 1, maxHeight:'33px' }}
                >
                  Nuevo
                </Button>
              )}
            </Box>
          </Box>

        </Stack>
      </Paper>

      {/* Sección de Resultados */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}>
            <Box sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PersonIcon />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Contribuyentes Encontrados
            </Typography>
            <Chip 
              label={`${contribuyentes.length} registro${contribuyentes.length !== 1 ? 's' : ''}`}
              color="info" 
              size="small"
            />
          </Box>

          {loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ))}
            </Box>
          ) : contribuyentes.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                No se encontraron contribuyentes que coincidan con los criterios de búsqueda.
              </Typography>
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contribuyente</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Documento</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contacto</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contribuyentesPaginados.map((contribuyente) => (
                    <TableRow 
                      key={contribuyente.codigo}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Chip
                          label={contribuyente.codigo}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {getTipoPersonaIcon(contribuyente.tipoPersona)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {contribuyente.contribuyente}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BadgeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {contribuyente.documento}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                            {contribuyente.direccion}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {contribuyente.telefono && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {contribuyente.telefono}
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={contribuyente.tipoPersona === 'juridica' ? 'Jurídica' : 'Natural'}
                          size="small"
                          color={getTipoPersonaColor(contribuyente.tipoPersona) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={contribuyente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={contribuyente.estado === 'activo' ? 'success' : 'default'}
                          variant={contribuyente.estado === 'activo' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, contribuyente)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={contribuyentes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onVer && (
          <MenuItem onClick={handleVer}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver detalles</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleEditar}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default ContribuyenteConsulta;