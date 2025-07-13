// src/pages/predio/ConsultaAsignacionPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import SelectorContribuyente from '../../components/modal/SelectorContribuyente';
import { NotificationService } from '../../components/utils/Notification';

const ConsultaAsignacionPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  // Estados
  const [filtros, setFiltros] = useState({
    año: currentYear,
    contribuyente: null as any,
    codigoPredio: ''
  });
  
  const [showContribuyenteModal, setShowContribuyenteModal] = useState(false);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);

  // Generar opciones de años
  const añosOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Mock data para demostración
  const mockAsignaciones = [
    {
      codigoPredio: '130077',
      direccion: 'Sector Central Barrio B1 Mz-21 - Av Gran Chimu N°650 - Unidad 2',
      estado: 'ACTIVO'
    }
  ];

  // Handlers
  const handleSelectContribuyente = (contribuyente: any) => {
    setFiltros({ ...filtros, contribuyente });
    setShowContribuyenteModal(false);
    // Aquí cargarías las asignaciones del contribuyente
    setAsignaciones(mockAsignaciones);
  };

  const handleBuscar = () => {
    // Aquí iría la lógica de búsqueda
    NotificationService.info('Buscando asignaciones...');
    setAsignaciones(mockAsignaciones);
  };

  const handleImprimirPU = () => {
    if (!filtros.contribuyente) {
      NotificationService.error('Debe seleccionar un contribuyente');
      return;
    }
    NotificationService.success('Generando PU...');
  };

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Módulo', path: '/' },
    { label: 'Predio', path: '/predio' },
    { label: 'Asignación de predios', path: '/predio/asignacion' },
    { label: 'Consulta', active: true }
  ];

  return (
    <MainLayout title="Consulta de Asignaciones">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                
                if (isLast || item.active) {
                  return (
                    <Typography key={item.label} color="text.primary">
                      {item.label}
                    </Typography>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path || '/'}
                    underline="hover"
                    color="inherit"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Sección: PU-Contribuyente */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PU- Contribuyente
              </Typography>
              
              <Paper sx={{ p: 3, bgcolor: '#F9F9F9' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Buscar Contribuyente y Predio
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Año
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select 
                          value={filtros.año}
                          onChange={(e) => setFiltros({ ...filtros, año: Number(e.target.value) })}
                        >
                          {añosOptions.map(año => (
                            <MenuItem key={año} value={año}>{año}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setShowContribuyenteModal(true)}
                        sx={{ 
                          bgcolor: '#E0E0E0', 
                          color: 'text.primary',
                          '&:hover': { bgcolor: '#D0D0D0' },
                          mt: 2.5
                        }}
                      >
                        Seleccionar contribuyente
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Código
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={filtros.contribuyente?.codigo || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                      <Typography variant="subtitle2" gutterBottom>
                        Nombre del contribuyente
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={filtros.contribuyente?.contribuyente || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Tabla de asignaciones */}
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código Predio</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {asignaciones.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No hay asignaciones para mostrar
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        asignaciones.map((asignacion, index) => (
                          <TableRow key={index}>
                            <TableCell>{asignacion.codigoPredio}</TableCell>
                            <TableCell>{asignacion.direccion}</TableCell>
                            <TableCell>
                              <Chip 
                                label={asignacion.estado} 
                                color="success" 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Editar">
                                <IconButton size="small" color="primary">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton size="small" color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Botón Imprimir PU */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handleImprimirPU}
                    sx={{ 
                      bgcolor: '#6B7280',
                      '&:hover': { bgcolor: '#4B5563' }
                    }}
                  >
                    Imprimir PU
                  </Button>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Modal Selector de Contribuyente */}
      <SelectorContribuyente
        isOpen={showContribuyenteModal}
        onClose={() => setShowContribuyenteModal(false)}
        onSelectContribuyente={handleSelectContribuyente}
        title="Seleccionar contribuyente"
      />

      {/* Notificaciones */}
     
    </MainLayout>
  );
};

export default ConsultaAsignacionPage;