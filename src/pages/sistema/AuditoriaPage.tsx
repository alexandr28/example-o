// src/pages/sistema/AuditoriaPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  MenuItem
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: `0 4px 20px ${theme.palette.primary.main}30`,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

// Datos de ejemplo
const auditoriasEjemplo = [
  {
    id: 1,
    fecha: '2025-10-31 09:30:15',
    usuario: 'Juan Pérez',
    modulo: 'Contribuyentes',
    accion: 'Crear',
    descripcion: 'Registro de nuevo contribuyente: DNI 12345678',
    ip: '192.168.1.100'
  },
  {
    id: 2,
    fecha: '2025-10-31 09:15:42',
    usuario: 'María García',
    modulo: 'Caja',
    accion: 'Cobro',
    descripcion: 'Cobro realizado por S/. 150.00',
    ip: '192.168.1.105'
  },
  {
    id: 3,
    fecha: '2025-10-31 08:45:20',
    usuario: 'Carlos López',
    modulo: 'Predios',
    accion: 'Editar',
    descripcion: 'Actualización de datos del predio: COD-12345',
    ip: '192.168.1.110'
  },
  {
    id: 4,
    fecha: '2025-10-31 08:30:05',
    usuario: 'Admin',
    modulo: 'Sistema',
    accion: 'Configuración',
    descripcion: 'Cambio en configuración del sistema',
    ip: '192.168.1.1'
  }
];

const AuditoriaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');

  const filteredAuditorias = auditoriasEjemplo.filter(audit => {
    const matchSearch =
      audit.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchModulo = filtroModulo === 'todos' || audit.modulo === filtroModulo;

    return matchSearch && matchModulo;
  });

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'Crear': return 'success';
      case 'Editar': return 'info';
      case 'Eliminar': return 'error';
      case 'Cobro': return 'primary';
      default: return 'default';
    }
  };

  return (
    <MainLayout title="Auditoría del Sistema">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HistoryIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Auditoría del Sistema
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Registro de actividades y acciones del sistema
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Información */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Consulte el historial de todas las acciones realizadas en el sistema.
          </Typography>
        </Alert>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Buscar por usuario o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />
            <TextField
              select
              size="small"
              label="Módulo"
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="todos">Todos los módulos</MenuItem>
              <MenuItem value="Contribuyentes">Contribuyentes</MenuItem>
              <MenuItem value="Predios">Predios</MenuItem>
              <MenuItem value="Caja">Caja</MenuItem>
              <MenuItem value="Sistema">Sistema</MenuItem>
            </TextField>
          </Box>
        </Paper>

        {/* Tabla de Auditoría */}
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Fecha y Hora</StyledTableCell>
                <StyledTableCell>Usuario</StyledTableCell>
                <StyledTableCell>Módulo</StyledTableCell>
                <StyledTableCell align="center">Acción</StyledTableCell>
                <StyledTableCell>Descripción</StyledTableCell>
                <StyledTableCell>IP</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAuditorias.length > 0 ? (
                filteredAuditorias.map((audit) => (
                  <StyledTableRow key={audit.id}>
                    <TableCell>{audit.fecha}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{audit.usuario}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={audit.modulo} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={audit.accion}
                        size="small"
                        color={getAccionColor(audit.accion) as any}
                      />
                    </TableCell>
                    <TableCell>{audit.descripcion}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {audit.ip}
                      </Typography>
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No se encontraron registros de auditoría
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </PageContainer>
    </MainLayout>
  );
};

export default AuditoriaPage;
