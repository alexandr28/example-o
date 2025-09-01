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
  alpha,
  Fade,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  Add as AddIcon
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
  { id: 'codigo', label: 'Código', numeric: true, width: '80px' },
  { id: 'descripcion', label: 'Dirección Completa', numeric: false, width: '500px' },
  { id: 'rutaNombre', label: 'Ruta', numeric: false, width: '120px' },
  { id: 'zonaNombre', label: 'Zona', numeric: false, width: '120px' },
  { id: 'actions', label: 'Acciones', numeric: false, width: '90px' }
];

const DireccionListMUI: React.FC<DireccionListProps> = ({
  direcciones = [],
  direccionSeleccionada,
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

  // Debug
  console.log('📊 DireccionList - Direcciones recibidas:', direcciones.length);
  if (direcciones.length > 0) {
    console.log('Ejemplo de dirección:', direcciones[0]);
    console.log('Campos disponibles:', Object.keys(direcciones[0]));
    console.log('descripcion:', direcciones[0].descripcion);
    console.log('rutaNombre:', direcciones[0].rutaNombre);
    console.log('zonaNombre:', direcciones[0].zonaNombre);
  }

  // Filtrar direcciones localmente solo con búsqueda general
  const filteredDirecciones = useMemo(() => {
    let result = direcciones;
    
    // Filtro de búsqueda general
    if (localSearchTerm) {
      const searchLower = localSearchTerm.toLowerCase();
      result = result.filter(direccion => 
        direccion.descripcion?.toLowerCase().includes(searchLower) ||
        direccion.rutaNombre?.toLowerCase().includes(searchLower) ||
        direccion.zonaNombre?.toLowerCase().includes(searchLower) ||
        direccion.codigo?.toString().includes(searchLower)
      );
    }
    
    return result;
  }, [direcciones, localSearchTerm]);

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

  const handleChangePage = (_: unknown, newPage: number) => {
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

  // Nueva función para búsqueda con API query params
  const handleSearchWithParams = (searchValue: string) => {
    if (onSearch) {
      // Enviar parámetros para la nueva API
      onSearch(searchValue);
    }
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
            placeholder="Buscar por dirección completa, ruta, zona, código..."
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
          
          {/* Botón Buscar */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={() => {
              if (onSearch && localSearchTerm.trim()) {
                onSearch(localSearchTerm.trim());
              }
            }}
            disabled={!localSearchTerm.trim()}
            sx={{
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Buscar
          </Button>

          {/* Botón Nuevo */}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => {
              // Limpiar búsqueda
              setLocalSearchTerm('');
              if (onSearch) {
                onSearch('');
              }
              // Ejecutar función de nueva dirección si existe
              if (onEditDireccion) {
                onEditDireccion({} as DireccionData);
              }
            }}
            sx={{
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Nuevo
          </Button>
    
        </Box>


        
        <TableContainer 
          component={Paper}
          elevation={3}
          sx={(theme) => ({ 
            width: '100%',
            height: 450,
            maxHeight: 450,
            borderRadius: 2,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            overflow: 'auto',
            position: 'relative',
            background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
            boxShadow: `
              0 4px 8px ${alpha(theme.palette.common.black, 0.1)},
              0 1px 3px ${alpha(theme.palette.common.black, 0.08)}
            `,
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: 12,
              height: 12,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.grey[200], 0.5),
              borderRadius: 6,
              margin: 2
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.6),
              borderRadius: 6,
              border: `2px solid ${theme.palette.background.paper}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.8)
              },
              '&:active': {
                bgcolor: theme.palette.primary.main
              }
            },
            '&::-webkit-scrollbar-corner': {
              bgcolor: theme.palette.background.paper,
            },
          })}
        >
          <Table stickyHeader size="medium" sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={
                      headCell.id === 'codigo' ? 'center' :
                      headCell.id === 'actions' ? 'center' : 
                      headCell.id === 'descripcion' ? 'left' :
                      headCell.id === 'rutaNombre' ? 'left' :
                      headCell.id === 'zonaNombre' ? 'left' :
                      headCell.numeric ? 'right' : 'left'
                    }
                    sx={(theme) => ({ 
                      width: headCell.width,
                      padding: 
                        headCell.id === 'codigo' ? '4px 8px' :
                        headCell.id === 'descripcion' ? '8px 16px' :
                        headCell.id === 'rutaNombre' || headCell.id === 'zonaNombre' ? '4px 8px' : '8px 16px',
                      minWidth: headCell.width,
                      maxWidth: headCell.width,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      zIndex: 100,
                      boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: theme.palette.primary.main,
                        zIndex: -1
                      }
                    })}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.id !== 'actions' ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof DireccionData)}
                        sx={{
                          color: 'inherit !important',
                          '& .MuiTableSortLabel-icon': {
                            color: 'inherit !important',
                            opacity: 1
                          },
                          '&:hover': {
                            color: 'inherit',
                            '& .MuiTableSortLabel-icon': {
                              color: 'inherit'
                            }
                          },
                          '&.Mui-active': {
                            color: 'inherit',
                            '& .MuiTableSortLabel-icon': {
                              color: 'inherit'
                            }
                          }
                        }}
                      >
                        <Typography variant="caption" fontWeight={700} sx={{ color: 'inherit' }}>
                          {headCell.label}
                        </Typography>
                      </TableSortLabel>
                    ) : (
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'inherit' }}>
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
                        selected={isSelected}
                        sx={(theme) => ({ 
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
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
                        <TableCell sx={(theme) => ({ px: 2, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {direccion.descripcion || '-'}
                        </Typography>
                        </TableCell>
                        <TableCell sx={(theme) => ({ px: 1, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.813rem' }} noWrap>
                          {direccion.rutaNombre || '-'}
                        </Typography>
                        </TableCell>
                        <TableCell sx={(theme) => ({ px: 1, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` })}>
                        <Typography variant="body2" sx={{ fontSize: '0.813rem' }} noWrap>
                          {direccion.zonaNombre || '-'}
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