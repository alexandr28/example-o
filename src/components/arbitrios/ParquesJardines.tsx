import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Save as SaveIcon
} from '@mui/icons-material';

interface UbicacionOption {
  id: number;
  label: string;
}

interface RutaOption {
  id: number;
  label: string;
}

const ParquesJardines: React.FC = () => {
  // Estados para Registro de Tasas
  const [anioRegistro, setAnioRegistro] = useState<string>(new Date().getFullYear().toString());
  const [ubicacion, setUbicacion] = useState<UbicacionOption | null>(null);
  const [ruta, setRuta] = useState<RutaOption | null>(null);
  const [tasaNueva, setTasaNueva] = useState<string>('');
  
  // Estados para Consulta de Tasas
  const [anioConsulta, setAnioConsulta] = useState<string>(new Date().getFullYear().toString());
  
  // Estados para loading
  const [isLoading, setIsLoading] = useState(false);

  // Datos de ejemplo para los Autocomplete
  const ubicaciones: UbicacionOption[] = [
    { id: 1, label: 'Zona Centro' },
    { id: 2, label: 'Zona Norte' },
    { id: 3, label: 'Zona Sur' },
    { id: 4, label: 'Zona Este' },
    { id: 5, label: 'Zona Oeste' },
  ];

  const rutas: RutaOption[] = [
    { id: 1, label: 'Ruta 01 - Parque Central' },
    { id: 2, label: 'Ruta 02 - Jardines Municipales' },
    { id: 3, label: 'Ruta 03 - Plaza de Armas' },
    { id: 4, label: 'Ruta 04 - Alameda Principal' },
    { id: 5, label: 'Ruta 05 - Parque Infantil' },
  ];

  // Handlers para Registro
  const handleRegistroTasa = () => {
    console.log('Registrar Tasa:', {
      anio: anioRegistro,
      ubicacion,
      ruta,
      tasaNueva
    });
    // Aquí iría la lógica para registrar la tasa
  };

  const handleNuevo = () => {
    setAnioRegistro(new Date().getFullYear().toString());
    setUbicacion(null);
    setRuta(null);
    setTasaNueva('');
  };

  // Handler para Consulta
  const handleBuscar = () => {
    console.log('Buscar tasas del año:', anioConsulta);
    // Aquí iría la lógica para buscar las tasas
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Sección Registro de Tasas */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SaveIcon />
          Registro de Tasas
        </Typography>

        {/* Primera fila: Todos los campos */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap'
        }}>
          <TextField
            label="Año"
            value={anioRegistro}
            onChange={(e) => setAnioRegistro(e.target.value)}
            size="small"
            type="number"
            sx={{ 
              width: '120px',
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              }
            }}
            inputProps={{
              min: 2000,
              max: 2100
            }}
          />

          <Autocomplete
            value={ubicacion}
            onChange={(_, newValue) => setUbicacion(newValue)}
            options={ubicaciones}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{ minWidth: 200, flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ubicación"
                placeholder="Seleccione ubicación"
              />
            )}
          />

          <Autocomplete
            value={ruta}
            onChange={(_, newValue) => setRuta(newValue)}
            options={rutas}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{ minWidth: 250, flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ruta"
                placeholder="Seleccione ruta"
              />
            )}
          />

          <TextField
            label="Tasa Nueva"
            value={tasaNueva}
            onChange={(e) => setTasaNueva(e.target.value)}
            size="small"
            type="number"
            sx={{ 
              width: '150px',
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              }
            }}
            InputProps={{
              startAdornment: <Box sx={{ mr: 0.5, color: 'text.secondary' }}>S/</Box>
            }}
            placeholder="0.00"
          />
        </Box>

        {/* Segunda fila: Botones alineados a la derecha */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          mt: 2
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleRegistroTasa}
            disabled={!ubicacion || !ruta || !tasaNueva || isLoading}
            sx={{
              minWidth: 140,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Registrar Tasa
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
            disabled={isLoading}
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Nuevo
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Sección Consulta de Tasas */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SearchIcon />
          Consulta de Tasas
        </Typography>

        {/* Filtro de búsqueda */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 3
        }}>
          <TextField
            label="Año"
            value={anioConsulta}
            onChange={(e) => setAnioConsulta(e.target.value)}
            size="small"
            type="number"
            sx={{ 
              width: '120px',
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              }
            }}
            inputProps={{
              min: 2000,
              max: 2100
            }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            disabled={!anioConsulta || isLoading}
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Buscar
          </Button>
        </Box>

        {/* Área para mostrar resultados */}
        <Box sx={{
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body2" color="text.secondary">
            Los resultados de la búsqueda aparecerán aquí
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ParquesJardines;