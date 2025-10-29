// src/components/contribuyentes/ContribuyenteConsulta.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
  Chip,
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
  Skeleton,
  Container,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Edit as EditIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import PersonaForm from './PersonaForm';
import { useForm } from 'react-hook-form';
import { useConstantesOptions } from '../../hooks/useConstantesOptions';
import { constanteService } from '../../services';

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
  loading?: boolean;
}

const ContribuyenteConsulta: React.FC<ContribuyenteConsultaProps> = ({
  contribuyentes,
  onBuscar,
  onNuevo,
  onEditar,
  loading = false
}) => {

  // Estados del formulario de filtro - Para nueva API general
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [tipoContribuyente, setTipoContribuyente] = useState<any>(null);

  // Hook para cargar tipos de contribuyente
  const {
    options: tiposContribuyenteOptions,
    loading: loadingTipos,
    error: errorTipos
  } = useConstantesOptions(
    () => constanteService.obtenerTiposContribuyente(),
    (item) => ({
      value: item.codConstante,
      label: item.nombreCategoria,
      id: item.codConstante
    })
  );

  // Debug: Log tipos de contribuyente
  React.useEffect(() => {
    console.log('🔍 [ContribuyenteConsulta] Tipos Contribuyente:', {
      loading: loadingTipos,
      error: errorTipos,
      opciones: tiposContribuyenteOptions
    });
  }, [loadingTipos, errorTipos, tiposContribuyenteOptions]);
  
  // Estados para la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  // Estado para el modal de edición
  const [openEditModal, setOpenEditModal] = useState(false);
  const [contribuyenteEditando, setContribuyenteEditando] = useState<Contribuyente | null>(null);
  
  // Formulario para edición
  const editForm = useForm({
    defaultValues: {
      tipoPersona: 'natural',
      tipoDocumento: '',
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      fechaNacimiento: null,
      estadoCivil: '',
      sexo: ''
    }
  });


  // Manejo de la búsqueda con nueva API general
  const handleBuscar = () => {
    const filtro = {
      busqueda: textoBusqueda.trim() || ''
    };
    
    console.log('🔍 Buscando con texto:', filtro);
    onBuscar(filtro);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setTextoBusqueda('');
    setTipoContribuyente(null);

    // Buscar sin filtros para obtener todos los contribuyentes
    onBuscar({
      busqueda: ''
    });
  };

  // Determinar si hay filtros activos
  const tieneFiltrosActivos = textoBusqueda.trim();

  // Manejo de la edición
  const handleEditarContribuyente = (codigo: string | number) => {
    // Buscar el contribuyente en la lista actual
    const contribuyente = contribuyentes.find(c => c.codigo === codigo);
    if (contribuyente) {
      setContribuyenteEditando(contribuyente);
      
      // Parsear el nombre completo para extraer apellidos y nombres
      const nombrePartes = contribuyente.contribuyente.split(' ');
      const apellidoPaterno = nombrePartes[0] || '';
      const apellidoMaterno = nombrePartes[1] || '';
      const nombres = nombrePartes.slice(2).join(' ') || '';
      
      // Resetear el formulario con los datos del contribuyente
      editForm.reset({
        tipoPersona: contribuyente.tipoPersona === 'juridica' ? 'juridica' : 'natural',
        tipoDocumento: '4101', // Por defecto DNI, se debería obtener del contribuyente si está disponible
        numeroDocumento: contribuyente.documento,
        nombres: nombres,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        direccion: null, // Se necesitaría parsear o obtener de otra forma
        nFinca: '',
        otroNumero: '',
        telefono: contribuyente.telefono || '',
        fechaNacimiento: null,
        estadoCivil: '',
        sexo: ''
      });
      
      setOpenEditModal(true);
      console.log('📝 Editando contribuyente:', contribuyente);
    } else {
      console.error('❌ No se encontró el contribuyente con código:', codigo);
    }
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setContribuyenteEditando(null);
  };

  // Manejo de la tabla
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: 3, 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: 48, 
              height: 48 
            }}>
              <PersonIcon sx={{ fontSize: 24, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Consulta de Contribuyentes
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Busca y gestiona la información de contribuyentes registrados
              </Typography>
            </Box>
          </Box>
          {onNuevo && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={onNuevo}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              Nuevo Contribuyente
            </Button>
          )}
        </Box>
      </Paper>

      <Stack spacing={3}>
        {/* Sección de Resultados */}
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
            border: '1px solid',
            borderColor: 'divider',
            width: '100%',
            overflow: 'hidden',
            mx: 'auto',
            maxWidth: '100%'
          }}
        >
        <Box sx={{ p: 3 }}>
         

          {/* Sección de Filtros */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 2,
              pb: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{
                p: 0.5,
                borderRadius: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FilterIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Búsqueda General
              </Typography>
              {tieneFiltrosActivos && (
                <Chip 
                  label="Filtro activo" 
                  color="primary" 
                  size="small"
                  icon={<InfoIcon />}
                />
              )}
            </Box>

            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'flex-start' }
            }}>
              {/* AutoComplete Tipo Contribuyente */}
              <Box sx={{ width: { xs: '100%', sm: 250 } }}>
                <Autocomplete
                  value={tipoContribuyente}
                  onChange={(_event, newValue) => setTipoContribuyente(newValue)}
                  options={tiposContribuyenteOptions}
                  getOptionLabel={(option) => option?.label || ''}
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                  loading={loadingTipos}
                  disabled={loading}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo Contribuyente"
                      placeholder="Seleccione tipo"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingTipos ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {/* Campo de búsqueda general */}
              <Box sx={{
                flex: 1,
                minWidth: 0
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Buscar Contribuyente"
                  placeholder="Ingrese nombre, apellido, documento o cualquier texto para buscar..."
                  value={textoBusqueda}
                  onChange={(e) => {
                    setTextoBusqueda(e.target.value);
                  }}
                  disabled={loading}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: textoBusqueda && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setTextoBusqueda('')}
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
                  helperText="Búsqueda general por cualquier campo del contribuyente. Deje vacío para mostrar todos."
                />
              </Box>

              {/* Botones */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                minWidth: { xs: '100%', sm: 'auto' }
              }}>
                <Button
                  variant="contained"
                  onClick={handleBuscar}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                  sx={{ 
                    minWidth: { xs: 'auto', sm: '100px' },
                    height: '40px'
                  }}
                >
                  Buscar
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleLimpiar}
                  disabled={loading}
                  startIcon={<ClearIcon />}
                  sx={{ 
                    height: '40px'
                  }}
                >
                  Limpiar
                </Button>
              </Box>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, index) => (
                <Box key={`skeleton-${index}`} sx={{ mb: 2 }}>
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
            <>
              {/* Tabla para pantallas medianas y grandes */}
              <Box sx={{
                display: { xs: 'none', sm: 'block' },
                width: '100%'
              }}>
                <TableContainer sx={{
                  width: '100%',
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: 8
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555'
                  },
                  '& .MuiTable-root': {
                    width: '100%',
                    minWidth: 'auto',
                    tableLayout: 'auto'
                  }
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, padding: '12px 8px' }}>Código</TableCell>
                        <TableCell sx={{ fontWeight: 600, padding: '12px 8px' }}>Contribuyente</TableCell>
                        <TableCell sx={{ fontWeight: 600, padding: '12px 8px' }}>Documento</TableCell>
                        <TableCell sx={{ fontWeight: 600, padding: '12px 8px' }}>Dirección</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, padding: '12px 8px', display: { sm: 'none', lg: 'table-cell' } }}>Tipo</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, padding: '12px 8px' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contribuyentesPaginados.map((contribuyente, index) => (
                        <TableRow 
                          key={`table-${contribuyente.codigo}-${index}`}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell sx={{ padding: '8px' }}>
                            <Chip
                              label={contribuyente.codigo}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', display: { sm: 'none', md: 'flex' } }}>
                                {getTipoPersonaIcon(contribuyente.tipoPersona)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                                {contribuyente.contribuyente}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <BadgeIcon fontSize="small" color="action" sx={{ display: { sm: 'none', md: 'block' } }} />
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {contribuyente.documento}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                              <LocationIcon fontSize="small" color="action" sx={{ mt: 0.2, flexShrink: 0, display: { sm: 'none', lg: 'block' } }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.85rem',
                                  wordWrap: 'break-word',
                                  lineHeight: 1.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {contribuyente.direccion}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center" sx={{ padding: '8px', display: { sm: 'none', lg: 'table-cell' } }}>
                            <Chip
                              label={contribuyente.tipoPersona === 'juridica' ? 'Jurídica' : 'Natural'}
                              size="small"
                              color={getTipoPersonaColor(contribuyente.tipoPersona) as any}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ padding: '8px' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditarContribuyente(contribuyente.codigo)}
                              color="primary"
                              title="Editar contribuyente"
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <TablePagination
                    rowsPerPageOptions={[6, 12, 24]}
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
              </Box>

              {/* Cards solo para smartphones */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  justifyContent: 'flex-start'
                }}>
                  {contribuyentesPaginados.map((contribuyente, index) => (
                    <Box 
                      key={`card-${contribuyente.codigo}-${index}`}
                      sx={{ 
                        flex: '1 1 100%',
                        minWidth: '100%',
                        maxWidth: '100%'
                      }}
                    >
                      <Card
                        elevation={2}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            elevation: 4,
                            transform: 'translateY(-2px)',
                            borderColor: 'primary.main',
                          },
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <CardContent sx={{ flex: 1, p: 2 }}>
                          {/* Header de la card */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            mb: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: getTipoPersonaColor(contribuyente.tipoPersona) + '.main' 
                              }}>
                                {getTipoPersonaIcon(contribuyente.tipoPersona)}
                              </Avatar>
                              <Box>
                                <Chip
                                  label={contribuyente.codigo}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditarContribuyente(contribuyente.codigo)}
                              color="primary"
                              title="Editar contribuyente"
                              sx={{ mt: -1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>

                          {/* Nombre del contribuyente */}
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{ 
                              mb: 2, 
                              fontSize: '1rem',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {contribuyente.contribuyente}
                          </Typography>

                          {/* Información del contribuyente */}
                          <Stack spacing={1.5}>
                            {/* Documento */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BadgeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {contribuyente.documento}
                              </Typography>
                            </Box>

                            {/* Dirección */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <LocationIcon 
                                fontSize="small" 
                                color="action" 
                                sx={{ mt: 0.2, flexShrink: 0 }}
                              />
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.4,
                                }}
                              >
                                {contribuyente.direccion}
                              </Typography>
                            </Box>

                            {/* Teléfono */}
                            {contribuyente.telefono && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {contribuyente.telefono}
                                </Typography>
                              </Box>
                            )}

                            {/* Chips de estado y tipo */}
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1, 
                              mt: 1, 
                              flexWrap: 'wrap',
                              alignItems: 'center'
                            }}>
                              <Chip
                                label={contribuyente.tipoPersona === 'juridica' ? 'Jurídica' : 'Natural'}
                                size="small"
                                color={getTipoPersonaColor(contribuyente.tipoPersona) as any}
                                variant="outlined"
                              />
                              <Chip
                                label={contribuyente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                size="small"
                                color={contribuyente.estado === 'activo' ? 'success' : 'default'}
                                variant={contribuyente.estado === 'activo' ? 'filled' : 'outlined'}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>

                {/* Paginación para las cards */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <TablePagination
                    rowsPerPageOptions={[6, 12, 24]}
                    component="div"
                    count={contribuyentes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Cards por página:"
                    labelDisplayedRows={({ from, to, count }) => 
                      `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                    sx={{
                      '& .MuiTablePagination-toolbar': {
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </Box>
            </>
          )}
          </Box>
        </Paper>
      </Stack>

      {/* Modal de edición con PersonaForm */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            minHeight: '60vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditIcon color="primary" />
          Editar Contribuyente
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {contribuyenteEditando && (
            <PersonaForm
              form={editForm}
              isJuridica={editForm.watch('tipoPersona') === 'juridica'}
              onOpenDireccionModal={() => {
                console.log('Abrir modal de dirección');
                // Aquí se puede implementar el modal de dirección si es necesario
              }}
              direccion={editForm.watch('direccion')}
              getDireccionTextoCompleto={(direccion: any) => {
                // Función para obtener el texto completo de la dirección
                if (!direccion) return 'Sin dirección';
                return direccion.direccionCompleta || 'Sin dirección';
              }}
              disablePersonaFields={false}
              onGuardar={async (data) => {
                console.log('📝 Guardando datos actualizados:', data);
                // Aquí se puede llamar a la función onEditar original si se necesita
                if (onEditar && contribuyenteEditando) {
                  onEditar(contribuyenteEditando.codigo);
                }
                handleCloseEditModal();
              }}
              showGuardarButton={false} // No mostrar el botón interno, usaremos los del Dialog
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseEditModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={editForm.handleSubmit(async (data) => {
              console.log('📝 Guardando cambios:', data);
              // Aquí se puede implementar la lógica de guardado
              if (onEditar && contribuyenteEditando) {
                onEditar(contribuyenteEditando.codigo);
              }
              handleCloseEditModal();
            })}
            startIcon={<SaveIcon />}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContribuyenteConsulta;