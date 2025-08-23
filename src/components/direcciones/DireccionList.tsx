// src/components/direcciones/DireccionList.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Collapse,
  Button,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { DireccionData } from '../../services/direccionService';

interface DireccionListProps {
  direcciones: DireccionData[];
  direccionSeleccionada?: DireccionData | null;
  onSelectDireccion: (direccion: DireccionData) => void;
  onEditDireccion?: (direccion: DireccionData) => void;
  onDeleteDireccion?: (id: number) => void;
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
  searchTerm?: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof DireccionData | 'actions';
  label: string;
  numeric: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'codigo', label: 'Código', numeric: true, width: '90px' },
  { id: 'nombreSector', label: 'Sector', numeric: false, width: '180px' },
  { id: 'nombreBarrio', label: 'Barrio', numeric: false, width: '160px' },
  { id: 'nombreVia', label: 'Calle/Mz', numeric: false, width: '200px' },
  { id: 'cuadra', label: 'Cuadra', numeric: false, width: '60px' },
  { id: 'lado', label: 'Lado', numeric: false, width: '70px' },
  { id: 'loteInicial', label: 'L. Inicial', numeric: true, width: '70px' },
  { id: 'loteFinal', label: 'L. Final', numeric: true, width: '70px' },
  { id: 'actions', label: 'Acciones', numeric: false, width: '100px' }
];

const DireccionListMUI: React.FC<DireccionListProps> = ({
  direcciones = [],
  direccionSeleccionada,
  onSelectDireccion,
  onEditDireccion,
  onDeleteDireccion,
  loading = false,
  onSearch,
  searchTerm = ''
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DireccionData>('codigo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDireccion, setSelectedDireccion] = useState<DireccionData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sector: '',
    barrio: '',
    calle: '',
    lado: '',
    loteDesde: '',
    loteHasta: ''
  });

  // Debug
  console.log('📊 DireccionList - Direcciones recibidas:', direcciones.length);
  if (direcciones.length > 0) {
    console.log('Ejemplo de dirección:', direcciones[0]);
  }

  // Filtrar direcciones localmente con filtros avanzados
  const filteredDirecciones = useMemo(() => {
    let result = direcciones;
    
    // Filtro de búsqueda general
    if (localSearchTerm) {
      const searchLower = localSearchTerm.toLowerCase();
      result = result.filter(direccion => 
        direccion.descripcion?.toLowerCase().includes(searchLower) ||
        direccion.nombreSector?.toLowerCase().includes(searchLower) ||
        direccion.nombreBarrio?.toLowerCase().includes(searchLower) ||
        direccion.nombreVia?.toLowerCase().includes(searchLower) ||
        direccion.codigo?.toString().includes(searchLower)
      );
    }
    
    // Filtros avanzados
    if (filters.sector) {
      result = result.filter(d => 
        d.nombreSector?.toLowerCase().includes(filters.sector.toLowerCase())
      );
    }
    if (filters.barrio) {
      result = result.filter(d => 
        d.nombreBarrio?.toLowerCase().includes(filters.barrio.toLowerCase())
      );
    }
    if (filters.calle) {
      result = result.filter(d => 
        d.nombreVia?.toLowerCase().includes(filters.calle.toLowerCase())
      );
    }
    if (filters.lado) {
      result = result.filter(d => 
        d.lado?.toLowerCase().includes(filters.lado.toLowerCase())
      );
    }
    if (filters.loteDesde) {
      const loteDesde = parseInt(filters.loteDesde);
      result = result.filter(d => (d.loteInicial || 0) >= loteDesde);
    }
    if (filters.loteHasta) {
      const loteHasta = parseInt(filters.loteHasta);
      result = result.filter(d => (d.loteFinal || 0) <= loteHasta);
    }
    
    return result;
  }, [direcciones, localSearchTerm, filters]);

  // Ordenar direcciones
  const sortedDirecciones = useMemo(() => {
    const comparator = (a: DireccionData, b: DireccionData) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return order === 'asc' ? 1 : -1;
      if (!bValue) return order === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    };
    
    return [...filteredDirecciones].sort(comparator);
  }, [filteredDirecciones, order, orderBy]);

  // Paginación
  const paginatedDirecciones = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedDirecciones.slice(start, start + rowsPerPage);
  }, [sortedDirecciones, page, rowsPerPage]);

  const handleRequestSort = (property: keyof DireccionData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, direccion: DireccionData) => {
    setAnchorEl(event.currentTarget);
    setSelectedDireccion(direccion);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDireccion(null);
  };

  const handleEdit = () => {
    if (selectedDireccion && onEditDireccion) {
      onEditDireccion(selectedDireccion);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDireccion && onDeleteDireccion) {
      onDeleteDireccion(selectedDireccion.id);
    }
    handleMenuClose();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      sector: '',
      barrio: '',
      calle: '',
      lado: '',
      loteDesde: '',
      loteHasta: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LocationIcon />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Lista de Direcciones
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`Total: ${direcciones.length}`}
              color="primary"
              variant="filled"
              size="small"
            />
            <Chip
              label={`Filtradas: ${filteredDirecciones.length}`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        {/* Búsqueda expandida horizontalmente */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          width: '100%'
        }}>
          <TextField
            sx={{ 
              flex: '1 1 auto',
              maxWidth: '400px'
            }}
            variant="outlined"
            placeholder="Buscar por sector, barrio, calle, código..."
            value={localSearchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                height: 40,
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              }
            }}
          />
          
          {/* Chips de resumen expandidos */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            flex: '1 1 auto',
            justifyContent: 'flex-end'
          }}>
            <Chip
              label={`Total: ${direcciones.length}`}
              color="primary"
              variant="filled"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Activas: ${direcciones.filter(d => d.estado === 'ACTIVO').length}`}
              color="success"
              variant="outlined"
              size="medium"
            />
            <Chip
              label={`Filtradas: ${filteredDirecciones.length}`}
              color="info"
              variant="outlined"
              size="medium"
            />
            <Chip
              icon={<FilterIcon />}
              label={hasActiveFilters ? `Filtros (${Object.values(filters).filter(v => v !== '').length})` : 'Filtros'}
              variant={hasActiveFilters ? 'filled' : 'outlined'}
              color={hasActiveFilters ? 'primary' : 'default'}
              onClick={() => setShowFilters(!showFilters)}
              onDelete={hasActiveFilters ? handleClearFilters : undefined}
              deleteIcon={hasActiveFilters ? <ClearIcon /> : undefined}
              sx={{ 
                borderStyle: hasActiveFilters ? 'solid' : 'dashed',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            />
          </Box>
        </Box>

        {/* Panel de Filtros Avanzados */}
        <Collapse in={showFilters}>
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Filtros Avanzados
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              mt: 2
            }}>
              <TextField
                size="small"
                label="Sector"
                value={filters.sector}
                onChange={(e) => handleFilterChange('sector', e.target.value)}
                sx={{ flex: '1 1 150px', minWidth: '150px' }}
                placeholder="Filtrar por sector..."
              />
              <TextField
                size="small"
                label="Barrio"
                value={filters.barrio}
                onChange={(e) => handleFilterChange('barrio', e.target.value)}
                sx={{ flex: '1 1 150px', minWidth: '150px' }}
                placeholder="Filtrar por barrio..."
              />
              <TextField
                size="small"
                label="Calle/Mz"
                value={filters.calle}
                onChange={(e) => handleFilterChange('calle', e.target.value)}
                sx={{ flex: '1 1 150px', minWidth: '150px' }}
                placeholder="Filtrar por calle..."
              />
              <FormControl size="small" sx={{ flex: '0 0 120px', minWidth: '120px' }}>
                <InputLabel>Lado</InputLabel>
                <Select
                  value={filters.lado}
                  label="Lado"
                  onChange={(e) => handleFilterChange('lado', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Izquierdo">Izquierdo</MenuItem>
                  <MenuItem value="Derecho">Derecho</MenuItem>
                  <MenuItem value="Par">Par</MenuItem>
                  <MenuItem value="Impar">Impar</MenuItem>
                  <MenuItem value="Ninguno">Ninguno</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Lote Desde"
                type="number"
                value={filters.loteDesde}
                onChange={(e) => handleFilterChange('loteDesde', e.target.value)}
                sx={{ flex: '0 0 100px', minWidth: '100px' }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              <TextField
                size="small"
                label="Lote Hasta"
                type="number"
                value={filters.loteHasta}
                onChange={(e) => handleFilterChange('loteHasta', e.target.value)}
                sx={{ flex: '0 0 100px', minWidth: '100px' }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              <Box sx={{ 
                flex: '0 0 auto', 
                display: 'flex', 
                gap: 1,
                alignItems: 'center'
              }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                >
                  Limpiar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setShowFilters(false)}
                  endIcon={<ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>
            {hasActiveFilters && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary">
                  Filtros activos:
                </Typography>
                {filters.sector && (
                  <Chip
                    size="small"
                    label={`Sector: ${filters.sector}`}
                    onDelete={() => handleFilterChange('sector', '')}
                  />
                )}
                {filters.barrio && (
                  <Chip
                    size="small"
                    label={`Barrio: ${filters.barrio}`}
                    onDelete={() => handleFilterChange('barrio', '')}
                  />
                )}
                {filters.calle && (
                  <Chip
                    size="small"
                    label={`Calle: ${filters.calle}`}
                    onDelete={() => handleFilterChange('calle', '')}
                  />
                )}
                {filters.lado && (
                  <Chip
                    size="small"
                    label={`Lado: ${filters.lado}`}
                    onDelete={() => handleFilterChange('lado', '')}
                  />
                )}
                {filters.loteDesde && (
                  <Chip
                    size="small"
                    label={`Lote desde: ${filters.loteDesde}`}
                    onDelete={() => handleFilterChange('loteDesde', '')}
                  />
                )}
                {filters.loteHasta && (
                  <Chip
                    size="small"
                    label={`Lote hasta: ${filters.loteHasta}`}
                    onDelete={() => handleFilterChange('loteHasta', '')}
                  />
                )}
              </Box>
            )}
          </Paper>
        </Collapse>

        {/* Tabla con scroll interno */}
        <TableContainer 
          component={Paper}
          elevation={2}
          sx={{ 
            width: '100%',
            height: 450,
            maxHeight: 450,
            borderRadius: 2,
            border: `1px solid`,
            borderColor: 'divider',
            overflow: 'auto',
            position: 'relative',
            '& .MuiTable-root': {
              minWidth: 800
            },
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: (theme) => theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
              borderRadius: 2,
              opacity: 0.3,
              '&:hover': {
                opacity: 0.5,
              }
            },
            '&::-webkit-scrollbar-corner': {
              bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
            },
          }}>
          <Table stickyHeader size="medium" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={
                      headCell.id === 'codigo' ? 'center' :
                      headCell.id === 'actions' ? 'center' : 
                      headCell.id === 'cuadra' ? 'center' :
                      headCell.id === 'lado' ? 'center' :
                      headCell.id === 'loteInicial' ? 'center' :
                      headCell.id === 'loteFinal' ? 'center' :
                      headCell.numeric ? 'right' : 'left'
                    }
                    sx={(theme) => ({ 
                      width: headCell.width,
                      padding: 
                        headCell.id === 'cuadra' || headCell.id === 'lado' || 
                        headCell.id === 'loteInicial' || headCell.id === 'loteFinal' ? '4px 4px' : 
                        headCell.id === 'nombreBarrio' || headCell.id === 'nombreVia' ? '4px 8px' :
                        headCell.id === 'codigo' ? '4px 8px' : '8px 16px',
                      minWidth: headCell.width,
                      maxWidth: headCell.width,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    })}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.id !== 'actions' ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof DireccionData)}
                      >
                        <Typography variant="caption" fontWeight={600}>
                          {headCell.label}
                        </Typography>
                      </TableSortLabel>
                    ) : (
                      <Typography variant="caption" fontWeight={600}>
                        {headCell.label}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : paginatedDirecciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 2 
                    }}>
                      <LocationIcon sx={{ 
                        fontSize: 48, 
                        color: 'text.disabled' 
                      }} />
                      <Alert 
                        severity="info" 
                        variant="outlined"
                        sx={{ 
                          borderRadius: 2,
                          '& .MuiAlert-message': {
                            fontSize: '0.875rem'
                          }
                        }}
                      >
                        {localSearchTerm 
                          ? `No se encontraron direcciones con "${localSearchTerm}"`
                          : 'No hay direcciones registradas'}
                      </Alert>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDirecciones.map((direccion, index) => {
                  const isSelected = direccionSeleccionada?.id === direccion.id;
                  
                  return (
                    <Fade in={true} key={direccion.id} timeout={300 + (index * 50)}>
                      <TableRow
                        hover
                        onClick={() => onSelectDireccion(direccion)}
                        selected={isSelected}
                        sx={(theme) => ({ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            transform: 'translateY(-1px)',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.16),
                            }
                          },
                          '&:nth-of-type(even):not(.Mui-selected)': {
                            bgcolor: alpha(theme.palette.grey[100], 0.3),
                          }
                        })}
                      >
                        <TableCell align="center" sx={(theme) => ({ px: 1, py: 2, textAlign: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
                          {direccion.codigo || direccion.id}
                        </Typography>
                        </TableCell>
                        <TableCell sx={(theme) => ({ px: 1, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }} noWrap>
                          {direccion.nombreSector || '-'}
                        </Typography>
                        </TableCell>
                        <TableCell sx={(theme) => ({ px: 1, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }} noWrap>
                          {direccion.nombreBarrio || '-'}
                        </Typography>
                        </TableCell>
                        <TableCell sx={(theme) => ({ px: 1, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip 
                            label={direccion.nombreTipoVia || 'CALLE'} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', height: 18, px: 0.5 }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '0.813rem' }} noWrap>
                            {direccion.nombreVia || '-'}
                          </Typography>
                        </Box>
                        </TableCell>
                        <TableCell align="center" sx={(theme) => ({ px: 0.5, py: 2, textAlign: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.813rem', textAlign: 'center' }}>
                          {direccion.cuadra || '-'}
                        </Typography>
                        </TableCell>
                        <TableCell align="center" sx={(theme) => ({ px: 0.5, py: 2, textAlign: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.813rem', textAlign: 'center' }}>
                          {direccion.lado || '-'}
                        </Typography>
                        </TableCell>
                        <TableCell align="center" sx={(theme) => ({ px: 0.5, py: 2, textAlign: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.813rem', textAlign: 'center' }}>
                          {direccion.loteInicial || 0}
                        </Typography>
                        </TableCell>
                        <TableCell align="center" sx={(theme) => ({ px: 0.5, py: 2, textAlign: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.813rem', textAlign: 'center' }}>
                          {direccion.loteFinal || 0}
                        </Typography>
                        </TableCell>
                        <TableCell align="center" sx={(theme) => ({ px: 1, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditDireccion) {
                                  onEditDireccion(direccion);
                                }
                              }}
                              sx={(theme) => ({
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación expandida */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {paginatedDirecciones.length} de {filteredDirecciones.length} direcciones
          </Typography>
          <TablePagination
            component="div"
            count={filteredDirecciones.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Filas por página:"
            sx={{ 
              border: 'none',
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 0,
                paddingRight: 0
              }
            }}
          />
        </Box>

        {/* Menú de acciones */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {onEditDireccion && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>
          )}
          {onDeleteDireccion && (
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Eliminar</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Stack>
    </Paper>
  );
};

export default DireccionListMUI;