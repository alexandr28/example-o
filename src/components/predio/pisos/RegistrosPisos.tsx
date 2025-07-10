// src/components/predio/pisos/RegistrosPisos.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  useTheme,
  alpha
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Domain as DomainIcon,
  Save as SaveIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import { usePisos } from '../../../hooks/usePisos';
import SelectorPredios from './SelectorPredios';
import { NotificationService } from '../../utils/Notification';

// Enums
enum Material {
  CONCRETO = 'Concreto',
  LADRILLO = 'Ladrillo',
  ADOBE = 'Adobe'
}

enum EstadoConservacion {
  MUY_BUENO = 'Muy bueno',
  BUENO = 'Bueno',
  REGULAR = 'Regular',
  MALO = 'Malo'
}

enum FormaRegistro {
  INDIVIDUAL = 'INDIVIDUAL',
  MASIVO = 'MASIVO'
}

// Interfaces
interface PisoFormData {
  descripcion: string;
  fechaConstruccion: Date | null;
  antiguedad: string;
  estadoConservacion: string;
  areaConstruida: string;
  materialPredominante: string;
  formaRegistro: string;
  otrasInstalaciones: string;
}

interface Predio {
  id: number | string;
  codigoPredio: string;
  direccion?: string;
}

interface CategoriaSeleccion {
  [categoria: string]: {
    [columna: string]: boolean;
  };
}

const RegistrosPisos: React.FC = () => {
  const theme = useTheme();
  const { guardarPiso, loading } = usePisos();
  
  // Estados
  const [predio, setPredio] = useState<Predio | null>(null);
  const [showSelectorPredios, setShowSelectorPredios] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<CategoriaSeleccion>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado del formulario
  const [formData, setFormData] = useState<PisoFormData>({
    descripcion: '',
    fechaConstruccion: null,
    antiguedad: '30 años',
    estadoConservacion: '',
    areaConstruida: '',
    materialPredominante: '',
    formaRegistro: FormaRegistro.INDIVIDUAL,
    otrasInstalaciones: '0.00'
  });

  // Opciones para selectores
  const estadosConservacion = Object.values(EstadoConservacion);
  const materiales = Object.values(Material);
  const formasRegistro = [
    { value: FormaRegistro.INDIVIDUAL, label: 'Individual' },
    { value: FormaRegistro.MASIVO, label: 'Masivo' }
  ];

  // Categorías para la tabla
  const categorias = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const columnas = [
    { key: 'murosColumnas', label: 'MUROS Y COLUMNAS' },
    { key: 'techo', label: 'TECHO' },
    { key: 'pisos', label: 'PISOS' },
    { key: 'revestimiento', label: 'REVESTIMIENTO' },
    { key: 'puertasVentanas', label: 'PUERTAS Y VENTANAS' },
    { key: 'instalaciones', label: 'INSTALACIONES ELÉCTRICAS Y SANITARIAS' }
  ];

  // Calcular antigüedad cuando cambia la fecha
  useEffect(() => {
    if (formData.fechaConstruccion) {
      const fecha = new Date(formData.fechaConstruccion);
      const hoy = new Date();
      const antiguedad = hoy.getFullYear() - fecha.getFullYear();
      setFormData(prev => ({ ...prev, antiguedad: `${antiguedad} años` }));
    }
  }, [formData.fechaConstruccion]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof PisoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar selección de checkbox
  const handleCheckboxChange = (categoria: string, columna: string) => {
    setSelectedLetters(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [columna]: !prev[categoria]?.[columna]
      }
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!predio) newErrors.predio = 'Debe seleccionar un predio';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.fechaConstruccion) newErrors.fechaConstruccion = 'La fecha es requerida';
    if (!formData.estadoConservacion) newErrors.estadoConservacion = 'Seleccione el estado';
    if (!formData.areaConstruida || parseFloat(formData.areaConstruida) <= 0) {
      newErrors.areaConstruida = 'El área debe ser mayor a 0';
    }
    if (!formData.materialPredominante) newErrors.materialPredominante = 'Seleccione el material';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar piso
  const handleSubmit = async () => {
    if (!validateForm()) {
      NotificationService.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      await guardarPiso({
        ...formData,
        predioId: predio!.id,
        categorias: selectedLetters
      });
      
      NotificationService.success('Piso registrado correctamente');
      
      // Limpiar formulario
      setFormData({
        descripcion: '',
        fechaConstruccion: null,
        antiguedad: '30 años',
        estadoConservacion: '',
        areaConstruida: '',
        materialPredominante: '',
        formaRegistro: FormaRegistro.INDIVIDUAL,
        otrasInstalaciones: '0.00'
      });
      setSelectedLetters({});
      
    } catch (error) {
      console.error('Error al guardar piso:', error);
      NotificationService.error('Error al guardar el piso');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        {/* Sección: Seleccionar predio */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <DomainIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Seleccionar predio
              </Typography>
            </Stack>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowSelectorPredios(true)}
                  startIcon={<SearchIcon />}
                  error={!!errors.predio}
                >
                  Seleccionar predio
                </Button>
                {errors.predio && (
                  <FormHelperText error>{errors.predio}</FormHelperText>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código de predio"
                  value={predio?.codigoPredio || ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={predio?.direccion || ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sección: Datos del piso */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <EngineeringIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Datos del piso
              </Typography>
            </Stack>
            
            <Grid container spacing={3}>
              {/* Primera fila */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth error={!!errors.descripcion}>
                  <InputLabel>Descripción</InputLabel>
                  <Select
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    label="Descripción"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="Primer piso">Primer piso</MenuItem>
                    <MenuItem value="Segundo piso">Segundo piso</MenuItem>
                    <MenuItem value="Tercer piso">Tercer piso</MenuItem>
                    <MenuItem value="Sótano">Sótano</MenuItem>
                    <MenuItem value="Azotea">Azotea</MenuItem>
                  </Select>
                  {errors.descripcion && (
                    <FormHelperText>{errors.descripcion}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Fecha de construcción"
                  value={formData.fechaConstruccion}
                  onChange={(date) => handleInputChange('fechaConstruccion', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.fechaConstruccion,
                      helperText: errors.fechaConstruccion
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Antigüedad"
                  value={formData.antiguedad}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth error={!!errors.estadoConservacion}>
                  <InputLabel>Estado de conservación</InputLabel>
                  <Select
                    value={formData.estadoConservacion}
                    onChange={(e) => handleInputChange('estadoConservacion', e.target.value)}
                    label="Estado de conservación"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {estadosConservacion.map(estado => (
                      <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                    ))}
                  </Select>
                  {errors.estadoConservacion && (
                    <FormHelperText>{errors.estadoConservacion}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Segunda fila */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Área construida"
                  value={formData.areaConstruida}
                  onChange={(e) => handleInputChange('areaConstruida', e.target.value)}
                  error={!!errors.areaConstruida}
                  helperText={errors.areaConstruida}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>
                  }}
                  type="number"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth error={!!errors.materialPredominante}>
                  <InputLabel>Material predominante</InputLabel>
                  <Select
                    value={formData.materialPredominante}
                    onChange={(e) => handleInputChange('materialPredominante', e.target.value)}
                    label="Material predominante"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {materiales.map(material => (
                      <MenuItem key={material} value={material}>{material}</MenuItem>
                    ))}
                  </Select>
                  {errors.materialPredominante && (
                    <FormHelperText>{errors.materialPredominante}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Forma de registro
                  </Typography>
                  <RadioGroup
                    row
                    value={formData.formaRegistro}
                    onChange={(e) => handleInputChange('formaRegistro', e.target.value)}
                  >
                    {formasRegistro.map(forma => (
                      <FormControlLabel
                        key={forma.value}
                        value={forma.value}
                        control={<Radio size="small" />}
                        label={forma.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Otras instalaciones"
                  value={formData.otrasInstalaciones}
                  onChange={(e) => handleInputChange('otrasInstalaciones', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">S/</InputAdornment>
                  }}
                  type="number"
                />
              </Grid>
            </Grid>

            {/* Tabla de categorías */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Selección de categorías constructivas
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>CATEGORÍA</TableCell>
                      {columnas.map(col => (
                        <TableCell key={col.key} align="center" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categorias.map(categoria => (
                      <TableRow key={categoria}>
                        <TableCell>
                          <Chip
                            label={categoria}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        {columnas.map(col => (
                          <TableCell key={col.key} align="center">
                            <Checkbox
                              size="small"
                              checked={selectedLetters[categoria]?.[col.key] || false}
                              onChange={() => handleCheckboxChange(categoria, col.key)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Botón guardar */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Piso'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Modal de selección de predios */}
        <SelectorPredios
          open={showSelectorPredios}
          onClose={() => setShowSelectorPredios(false)}
          onSelect={(predioSeleccionado) => {
            setPredio(predioSeleccionado);
            setShowSelectorPredios(false);
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default RegistrosPisos;