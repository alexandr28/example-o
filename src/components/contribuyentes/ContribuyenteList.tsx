// src/components/contribuyentes/ContribuyenteListMUI.tsx
import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Box,
  Typography,
  Skeleton,
  Alert,
  Tooltip,
  useTheme,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface Contribuyente {
  codigo: string | number;  // Acepta ambos tipos
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica' | string;
  estado?: 'activo' | 'inactivo';
}

interface ContribuyenteListProps {
  contribuyentes: Contribuyente[];
  onEditar: (codigo: string | number) => void;
  onVer?: (codigo: string | number) => void;
  loading?: boolean;
}

const ContribuyenteListMUI: React.FC<ContribuyenteListProps> = ({
  contribuyentes,
  onEditar,
  onVer,
  loading = false
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | number>('');

  // Manejo del menú de acciones
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, codigo: string | number) => {
    setAnchorEl(event.currentTarget);
    setSelectedCodigo(codigo);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCodigo('');
  };

  const handleMenuAction = (action: 'ver' | 'editar') => {
    if (selectedCodigo) {
      if (action === 'ver' && onVer) {
        onVer(selectedCodigo);
      } else if (action === 'editar') {
        onEditar(selectedCodigo);
      }
    }
    handleMenuClose();
  };

  // Cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calcular datos paginados
  const paginatedContribuyentes = contribuyentes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Obtener icono según tipo de persona
  const getTipoPersonaIcon = (tipo?: string) => {
    return tipo === 'juridica' ? 
      <BusinessIcon sx={{ fontSize: 16 }} /> : 
      <PersonIcon sx={{ fontSize: 16 }} />;
  };

  // Obtener avatar según tipo
  const getAvatar = (tipo?: string, nombre?: string) => {
    const icon = tipo === 'juridica' ? 
      <BusinessIcon sx={{ fontSize: 18 }} /> : 
      <PersonIcon sx={{ fontSize: 18 }} />;
    
    const bgcolor = tipo === 'juridica' ? 
      theme.palette.info.main : 
      theme.palette.success.main;

    return (
      <Avatar sx={{ width: 32, height: 32, bgcolor, fontSize: 14 }}>
        {icon}
      </Avatar>
    );
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: '900px' }}>
        <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ))}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '900px' }}>
      <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Lista de Contribuyentes
            </Typography>
            <Chip 
              label={`${contribuyentes.length} registros`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Box>

        {contribuyentes.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 48, color: theme.palette.info.main, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron contribuyentes con los criterios especificados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intenta modificar los filtros de búsqueda
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Contribuyente</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Documento</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Dirección / Contacto</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedContribuyentes.map((contribuyente) => (
                    <TableRow 
                      key={contribuyente.codigo}
                      hover
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: theme.palette.action.hover 
                        },
                        '& td': { 
                          py: 1.5,
                          fontSize: '0.813rem'
                        }
                      }}
                    >
                      <TableCell>
                        <Tooltip title={contribuyente.tipoPersona === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}>
                          {getAvatar(contribuyente.tipoPersona, contribuyente.contribuyente)}
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {contribuyente.contribuyente}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BadgeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {contribuyente.documento}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {contribuyente.direccion || 'Sin dirección'}
                            </Typography>
                          </Box>
                          {contribuyente.telefono && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {contribuyente.telefono}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {onVer && (
                            <Tooltip title="Ver detalles">
                              <IconButton 
                                size="small"
                                onClick={() => onVer(contribuyente.codigo)}
                                sx={{ color: theme.palette.info.main }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small"
                              onClick={() => onEditar(contribuyente.codigo)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, contribuyente.codigo)}
                          >
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={contribuyentes.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              sx={{ 
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiTablePagination-toolbar': { minHeight: 48 },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.813rem'
                }
              }}
            />
          </>
        )}

        {/* Menú de acciones */}
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
            <MenuItem onClick={() => handleMenuAction('ver')}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver detalles</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => handleMenuAction('editar')}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default ContribuyenteListMUI;