// src/components/predio/hr/HR.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  alpha,
  Autocomplete
} from '@mui/material';
import {
  Print as PrintIcon,
  Home as HomeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAnioOptions } from '../../../hooks/useConstantesOptions';
import SelectorContribuyente from '../../modal/SelectorContribuyente';
import SelectorPredio from '../../modal/SelectorPredio';

const HR: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Hooks para opciones
  const { options: aniosOptions } = useAnioOptions(2020);

  const [año, setAño] = useState(currentYear);

  // Estado para contribuyente seleccionado
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<any>(null);

  // Estado para predio seleccionado
  const [predioSeleccionado, setPredioSeleccionado] = useState<any>(null);

  // Estado para el modal de selección de contribuyente
  const [modalContribuyenteOpen, setModalContribuyenteOpen] = useState(false);

  // Handler para abrir el modal de contribuyente
  const handleOpenModalContribuyente = () => {
    setModalContribuyenteOpen(true);
  };

  // Handler para cerrar el modal de contribuyente
  const handleCloseModalContribuyente = () => {
    setModalContribuyenteOpen(false);
  };

  // Handler para seleccionar un contribuyente desde el modal
  const handleSelectContribuyente = (contribuyente: any) => {
    console.log('👤 HR - Contribuyente seleccionado:', contribuyente);
    setContribuyenteSeleccionado(contribuyente);
    setModalContribuyenteOpen(false);
  };

  // Estado para el modal de selección de predio
  const [modalPredioOpen, setModalPredioOpen] = useState(false);

  // Handler para abrir el modal de predio
  const handleOpenModalPredio = () => {
    setModalPredioOpen(true);
  };

  // Handler para cerrar el modal de predio
  const handleCloseModalPredio = () => {
    setModalPredioOpen(false);
  };

  // Handler para seleccionar un predio desde el modal
  const handleSelectPredio = (predio: any) => {
    console.log('🏠 HR - Predio seleccionado:', predio);
    setPredioSeleccionado(predio);
    setModalPredioOpen(false);
  };

  const handleImprimirHR = () => {
    console.log('🖨️ Imprimiendo Hoja de Resumen Contribuyente...');
    // TODO: Implementar lógica de impresión
  };

  const handleImprimirHRMasivo = () => {
    console.log('🖨️ Imprimiendo Hoja de Resumen Masivo...');
    // TODO: Implementar lógica de impresión masiva
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Sección: HR - Contribuyente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            HR - Contribuyente
          </Typography>

          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flex: '0 0 120px' }}>
                <Autocomplete
                  options={aniosOptions}
                  getOptionLabel={(option) => option?.label || ''}
                  value={aniosOptions.find(opt => opt.value === año.toString()) || null}
                  onChange={(_, newValue) => {
                    console.log('📅 HR-Contribuyente Año seleccionado:', newValue);
                    setAño(parseInt(newValue?.value?.toString() || currentYear.toString()));
                  }}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Año"
                      placeholder="Seleccione año..."
                    />
                  )}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '33px'
                    }
                  }}
                />
              </Box>
              {/* Seleccionar contribuyente */}
              <Box sx={{ flex: '0 0 150px' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  onClick={handleOpenModalContribuyente}
                  sx={{ height: 33 }}
                >
                  Seleccionar contribuyente
                </Button>
              </Box>
              {/* Código Contribuyente */}
              <Box sx={{ flex: '0 0 100px' }}>
                <TextField
                  fullWidth
                  label="Código"
                  value={contribuyenteSeleccionado?.codigo || ''}
                  disabled
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                />
              </Box>
              {/* Nombre Contribuyente */}
              <Box sx={{ flex: '1 1 250px' }}>
                <TextField
                  fullWidth
                  label="Nombre del contribuyente"
                  value={contribuyenteSeleccionado?.contribuyente || ''}
                  disabled
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                />
              </Box>
              {/* Imprimir HR */}
              <Box sx={{ flex: '0 0 120px' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handleImprimirHR}
                  sx={{ height: 33 }}
                >
                  Imprimir HR
                </Button>
              </Box>
            </Box>

            {/* Tabla de Predios */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código Predio</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Área Terreno</TableCell>
                    <TableCell>Área Construida</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>130077</TableCell>
                    <TableCell>Sector Central Barrio B1 Mz-21 - Av Gran Chimu N°650 - Unidad 2</TableCell>
                    <TableCell>120.00 m²</TableCell>
                    <TableCell>85.50 m²</TableCell>
                    <TableCell>
                      <Chip label="ACTIVO" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </CardContent>
      </Card>

      {/* Sección: HR - Masivo */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            HR - Masivo
          </Typography>

          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              {/* Seleccionar año */}
              <Box sx={{ flex: '0 0 100px' }}>
                <Autocomplete
                  options={aniosOptions}
                  getOptionLabel={(option) => option?.label || ''}
                  value={aniosOptions.find(opt => opt.value === año.toString()) || null}
                  onChange={(_, newValue) => setAño(parseInt(newValue?.value?.toString() || currentYear.toString()))}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Año"
                      placeholder="Seleccione año..."
                    />
                  )}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '33px'
                    }
                  }}
                />
              </Box>
              {/* Seleccionar predio */}
              <Box sx={{ flex: '0 0 140px' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={handleOpenModalPredio}
                  sx={{ height: 33 }}
                >
                  Seleccionar predio
                </Button>
              </Box>
              {/* Dirección predial */}
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Dirección predial"
                  value={predioSeleccionado?.direccion || predioSeleccionado?.descripcionDireccion || ''}
                  disabled
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                />
              </Box>
              {/* Imprimir HR Masivo */}
              <Box sx={{ flex: '0 0 140px' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handleImprimirHRMasivo}
                  sx={{ height: 33 }}
                >
                  Imprimir HR Masivo
                </Button>
              </Box>
            </Box>

            {/* Tabla de Predios */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código Predio</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Contribuyente</TableCell>
                    <TableCell>Área Terreno</TableCell>
                    <TableCell>Área Construida</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>130077</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>Cuzco Rodriguez Celinda Elena</TableCell>
                    <TableCell>120.00 m²</TableCell>
                    <TableCell>85.50 m²</TableCell>
                    <TableCell>
                      <Chip label="ACTIVO" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>145620</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>Maldona Maldonado Carlos</TableCell>
                    <TableCell>200.00 m²</TableCell>
                    <TableCell>150.00 m²</TableCell>
                    <TableCell>
                      <Chip label="ACTIVO" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </CardContent>
      </Card>

      {/* Modal de Selección de Contribuyente */}
      <SelectorContribuyente
        isOpen={modalContribuyenteOpen}
        onClose={handleCloseModalContribuyente}
        onSelectContribuyente={handleSelectContribuyente}
        title="Seleccionar Contribuyente"
        selectedId={contribuyenteSeleccionado?.codigo || null}
      />

      {/* Modal de Selección de Predio */}
      <SelectorPredio
        isOpen={modalPredioOpen}
        onClose={handleCloseModalPredio}
        onSelectPredio={handleSelectPredio}
        title="Seleccionar Predio"
        selectedId={predioSeleccionado?.codPredio || null}
      />
    </Box>
  );
};

export default HR;
