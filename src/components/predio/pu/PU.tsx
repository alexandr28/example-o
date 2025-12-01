// src/components/predio/pu/PU.tsx
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
  Autocomplete,
  Tabs,
  Tab
} from '@mui/material';
import {
  Print as PrintIcon,
  Home as HomeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAnioOptions } from '../../../hooks/useConstantesOptions';

interface PUProps {
  onSelectContribuyente?: () => void;
  onSelectPredio?: () => void;
}

const PU: React.FC<PUProps> = ({
  onSelectContribuyente,
  onSelectPredio
}) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Hooks para opciones
  const { options: aniosOptions } = useAnioOptions(2020);

  // Estado para controlar el tab activo (0: PU-Contribuyente, 1: PU-Masivo)
  const [activeTab, setActiveTab] = useState(0);
  const [año, setAño] = useState(currentYear);

  // Estado para contribuyente seleccionado
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<any>(null);

  // Estado para predio seleccionado
  const [predioSeleccionado, setPredioSeleccionado] = useState<any>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleImprimirPU = () => {
    console.log('🖨️ Imprimiendo PU Contribuyente...');
    // TODO: Implementar lógica de impresión
  };

  const handleImprimirPUMasivo = () => {
    console.log('🖨️ Imprimiendo PU Masivo...');
    // TODO: Implementar lógica de impresión masiva
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Tabs de navegación */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600
            }
          }}
        >
          <Tab label="PU-Contribuyente" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="PU-Masivo" icon={<HomeIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Panel de PU-Contribuyente */}
      {activeTab === 0 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PU- Contribuyente
              </Typography>

              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: '0 0 120px' }}>
                    <Autocomplete
                      options={aniosOptions}
                      getOptionLabel={(option) => option?.label || ''}
                      value={aniosOptions.find(opt => opt.value === año.toString()) || null}
                      onChange={(_, newValue) => {
                        console.log('📅 PU-Contribuyente Año seleccionado:', newValue);
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
                  <Box sx={{ flex: '0 0 120px' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PersonIcon />}
                      onClick={onSelectContribuyente}
                      sx={{ height: 33 }}
                    >
                      Seleccionar contribuyente
                    </Button>
                  </Box>
                  <Box sx={{ flex: '0 0 100px' }}>
                    <TextField
                      fullWidth
                      label="Código"
                      value={contribuyenteSeleccionado?.codigo || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 250px' }}>
                    <TextField
                      fullWidth
                      label="Nombre del contribuyente"
                      value={contribuyenteSeleccionado?.contribuyente || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 100px' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handleImprimirPU}
                      sx={{ height: 33 }}
                    >
                      Imprimir PU
                    </Button>
                  </Box>
                </Box>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código Predio</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>130077</TableCell>
                        <TableCell>Sector Central Barrio B1 Mz-21 - Av Gran Chimu N°650 - Unidad 2</TableCell>
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
        </Box>
      )}

      {/* Panel de PU-Masivo */}
      {activeTab === 1 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PU- Masivo
              </Typography>

              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
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
                  <Box sx={{ flex: '0 0 120px' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HomeIcon />}
                      onClick={onSelectPredio}
                      sx={{ height: 33 }}
                    >
                      Seleccionar predio
                    </Button>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Dirección predial"
                      value={predioSeleccionado?.direccion || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 120px' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handleImprimirPUMasivo}
                      sx={{ height: 33 }}
                    >
                      Imprimir PU Masivo
                    </Button>
                  </Box>
                </Box>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código Predio</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell>Contribuyente</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>130077</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>Cuzco Rodriguez Celinda Elena</TableCell>
                        <TableCell>
                          <Chip label="ACTIVO" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>145620</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>Maldona Maldonado Carlos</TableCell>
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
        </Box>
      )}
    </Box>
  );
};

export default PU;
