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
  alpha,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

interface Contribuyente {
  codigo: string;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: string;
  estado?: boolean;
}

interface ContribuyenteListProps {
  contribuyentes: Contribuyente[];
  onEditar: (codigo: string) => void;
  onVer?: (codigo: string) => void;
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
  const [selectedCodigo, setSelectedCodigo] = useState<string>('');

  // Manejo del menú de acciones
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, codigo: string) => {
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
    if (tipo?.toLowerCase().includes('juridica')) {
      return <BusinessIcon />;
    }
    return <PersonIcon />;
  };

  // Obtener color del chip según el tipo de documento
  const getDocumentoChipColor = (documento: string) => {
    if (documento.startsWith('20')) return 'primary'; // RUC empresa
    if (documento.startsWith('10')) return 'info'; // RUC persona
    if (documento.length === 8) return 'success'; // DNI
    return 'default';
  };

  // Skeleton rows para loading
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton width={100} /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton width={40} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          Lista de Contribuyentes
          <Chip
            label={contribuyentes.length}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        </Typography>
      </Box>

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contribuyente</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 140 }}>Documento</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dirección / Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : paginatedContribuyentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ display: 'inline-flex' }}>
                    No se encontraron contribuyentes con los criterios especificados
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              paginatedContribuyentes.map((contribuyente) => (
                <TableRow
                  key={contribuyente.codigo}
                  hover
                  sx={{ 
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  {/* Tipo de persona */}
                  <TableCell>
                    <Avatar
                      sx={{
                        bgcolor: contribuyente.tipoPersona?.includes('juridica') 
                          ? theme.palette.primary.main 
                          : theme.palette.secondary.main,
                        width: 40,
                        height: 40
                      }}
                    >
                      {getTipoPersonaIcon(contribuyente.tipoPersona)}
                    </Avatar>
                  </TableCell>

                  {/* Nombre del contribuyente */}
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {contribuyente.contribuyente}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Código: {contribuyente.codigo}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Documento */}
                  <TableCell>
                    <Chip
                      icon={<BadgeIcon />}
                      label={contribuyente.documento}
                      size="small"
                      color={getDocumentoChipColor(contribuyente.documento)}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Dirección y contacto */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {contribuyente.direccion}
                        </Typography>
                      </Box>
                      {contribuyente.telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {contribuyente.telefono}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, contribuyente.codigo)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={contribuyentes.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

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
  );
};

export default ContribuyenteListMUI;