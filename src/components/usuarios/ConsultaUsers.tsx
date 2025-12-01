// src/components/usuarios/ConsultaUsers.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActivarIcon,
  Cancel as BajaIcon,
  VpnKey as PasswordIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from '../../hooks/useUsuarios';
import { USER_ROLES, USER_ESTADOS } from '../../config/constants';
import { NotificationService } from '../utils/Notification';

// Opciones para filtros
const estadoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
];

const rolOptions = [
  { label: 'Todos', value: '' },
  { label: 'Administrador', value: USER_ROLES.ADMIN },
  { label: 'Cajero', value: USER_ROLES.CAJERO },
  { label: 'Gerente', value: USER_ROLES.GERENTE },
  { label: 'Supervisor', value: USER_ROLES.SUPERVISOR },
  { label: 'Usuario', value: USER_ROLES.USER },
];

interface SearchFilters {
  parametroBusqueda: string;
  codEstado: string;
  role: string;
}

interface EditDialogData {
  codUsuario: number;
  username: string;
  nombrePersona: string;
  documento: string;
  codEstado: string;
  codRol: number;
}

const ConsultaUsers: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<EditDialogData | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const {
    usuarios,
    loading,
    cargarUsuarios,
    actualizarUsuario
  } = useUsuarios();

  const { control, handleSubmit, reset, watch } = useForm<SearchFilters>({
    defaultValues: {
      parametroBusqueda: '',
      codEstado: '',
      role: '',
    }
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Aplicar filtros cuando cambien los usuarios o los filtros
  useEffect(() => {
    aplicarFiltros();
  }, [usuarios, watch('codEstado'), watch('role')]);

  const aplicarFiltros = () => {
    let filtered = [...usuarios];
    const estado = watch('codEstado');
    const role = watch('role');

    if (estado) {
      filtered = filtered.filter(u => u.estado === estado);
    }

    if (role) {
      filtered = filtered.filter(u => u.rol === role);
    }

    setFilteredUsers(filtered);
  };

  const onSearch = async (data: SearchFilters) => {
    try {
      console.log('[ConsultaUsers] Buscando con filtros:', data);
      await cargarUsuarios(data.parametroBusqueda ? { parametroBusqueda: data.parametroBusqueda } : undefined);
    } catch (error: any) {
      console.error('[ConsultaUsers] Error:', error);
      NotificationService.error('Error al buscar usuarios');
    }
  };

  const handleClear = () => {
    reset();
    cargarUsuarios();
    NotificationService.info('Filtros limpiados');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (user: any) => {
    console.log('[ConsultaUsers] Editar usuario:', user);
    setEditData({
      codUsuario: user.codUsuario,
      username: user.username,
      nombrePersona: user.nombrePersona,
      documento: user.documento,
      codEstado: user.estado === 'Activo' ? USER_ESTADOS.ACTIVO : USER_ESTADOS.INACTIVO,
      codRol: user.codRol || 1
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    try {
      await actualizarUsuario(editData);
      setEditDialogOpen(false);
      setEditData(null);
      await cargarUsuarios();
    } catch (error) {
      console.error('[ConsultaUsers] Error al actualizar:', error);
    }
  };

  const handleChangePassword = (user: any) => {
    console.log('[ConsultaUsers] Cambiar password para usuario:', user);
    // Navegar al tab de cambiar password
    navigate('/usuarios/recuperar-password', { state: { codUsuario: user.codUsuario } });
  };

  const handleOtrasOpciones = (user: any) => {
    console.log('[ConsultaUsers] Ir a otras opciones para usuario:', user);
    // Navegar al tab de otras opciones
    navigate('/usuarios/otras-opciones', { state: { codUsuario: user.codUsuario } });
  };

  const getEstadoColor = (estado: string) => {
    if (estado === 'Activo') return 'success';
    return 'default';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Consulta de Usuarios
      </Typography>

      {/* Filtros de busqueda */}
      <Box component="form" onSubmit={handleSubmit(onSearch)} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(40% - 8px)' } }}>
            <Controller
              name="parametroBusqueda"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Buscar"
                  fullWidth
                  disabled={loading}
                  placeholder="Buscar por nombre, username, documento..."
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(30% - 8px)' } }}>
            <Controller
              name="codEstado"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={estadoOptions}
                  getOptionLabel={(option) => option.label}
                  value={estadoOptions.find(opt => opt.value === value) || estadoOptions[0]}
                  onChange={(_, newValue) => {
                    onChange(newValue?.value || '');
                  }}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField {...params} label="Estado" />
                  )}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(30% - 8px)' } }}>
            <Controller
              name="role"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={rolOptions}
                  getOptionLabel={(option) => option.label}
                  value={rolOptions.find(opt => opt.value === value) || rolOptions[0]}
                  onChange={(_, newValue) => {
                    onChange(newValue?.value || '');
                  }}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField {...params} label="Rol" />
                  )}
                />
              )}
            />
          </Box>

          {/* Botones */}
          <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={loading}
              sx={{
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#2e7d32',
                  backgroundColor: 'rgba(76, 175, 80, 0.08)',
                }
              }}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                }
              }}
            >
              Buscar
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabla de resultados */}
      <TableContainer sx={{ border: '1px solid rgba(76, 175, 80, 0.2)', borderRadius: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
              <TableCell sx={{ fontWeight: 700 }}>Codigo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {loading ? 'Cargando...' : 'No hay resultados. Utilice los filtros para buscar usuarios.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.codUsuario} hover>
                    <TableCell>{user.codUsuario}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.nombrePersona}</TableCell>
                    <TableCell>{user.documento}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.estado}
                        color={getEstadoColor(user.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.rol}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{ color: '#4caf50' }}
                        onClick={() => handleEdit(user)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: '#ff9800' }}
                        onClick={() => handleChangePassword(user)}
                        title="Cambiar Password"
                      >
                        <PasswordIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={user.estado === 'Activo' ? 'error' : 'success'}
                        onClick={() => handleOtrasOpciones(user)}
                        title="Otras Opciones"
                      >
                        {user.estado === 'Activo' ? <BajaIcon fontSize="small" /> : <ActivarIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}

      {/* Dialog para editar */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Username"
              value={editData?.username || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, username: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Nombre Persona"
              value={editData?.nombrePersona || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, nombrePersona: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Documento"
              value={editData?.documento || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, documento: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Codigo Estado"
              value={editData?.codEstado || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, codEstado: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Codigo Rol"
              value={editData?.codRol || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, codRol: parseInt(e.target.value) || 1 } : null)}
              fullWidth
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#4caf50' }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ConsultaUsers;
