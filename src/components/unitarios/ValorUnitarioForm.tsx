// src/components/unitarios/ValorUnitarioForm.tsx
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  useTheme,
  alpha,
  Divider,
  Autocomplete,
  Button,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Title as TitleIcon,
  Layers as LayersIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { CategoriaValorUnitario, SubcategoriaValorUnitario, LetraValorUnitario } from '../../models';

interface ValorUnitarioFormProps {
  años: { value: string, label: string }[];
  categorias: { value: string, label: string }[];
  subcategoriasDisponibles: { value: string, label: string }[];
  letras: { value: string, label: string }[];
  añoSeleccionado: number | null;
  categoriaSeleccionada: CategoriaValorUnitario | null;
  subcategoriaSeleccionada: SubcategoriaValorUnitario | null;
  letraSeleccionada: LetraValorUnitario | null;
  loading: boolean;
  onAñoChange: (año: number | null) => void;
  onCategoriaChange: (categoria: CategoriaValorUnitario | null) => void;
  onSubcategoriaChange: (subcategoria: SubcategoriaValorUnitario | null) => void;
  onLetraChange: (letra: LetraValorUnitario | null) => void;
  onCostoChange: (costo: string) => void;
  costoValue: string;
  onRegistrar?: () => void;
  onEliminar?: () => void;
  isSubmitting?: boolean;
}

const ValorUnitarioForm: React.FC<ValorUnitarioFormProps> = ({
  años,
  categorias,
  subcategoriasDisponibles,
  letras,
  añoSeleccionado,
  categoriaSeleccionada,
  subcategoriaSeleccionada,
  letraSeleccionada,
  loading,
  onAñoChange,
  onCategoriaChange,
  onSubcategoriaChange,
  onLetraChange,
  onCostoChange,
  costoValue,
  onRegistrar,
  onEliminar,
  isSubmitting = false
}) => {
  const theme = useTheme();

  // Convertir las opciones al formato esperado por SearchableSelect (solo value y label)
  const añoOptions = años.map(año => ({
    value: parseInt(año.value),
    label: año.label
  }));

  const categoriaOptions = categorias.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  const subcategoriaOptions = subcategoriasDisponibles.map(sub => ({
    value: sub.value,
    label: sub.label
  }));

  const letraOptions = letras.map(letra => ({
    value: letra.value,
    label: letra.label
  }));

  // Helpers para descripciones
  function getCategoriaDescription(categoria: string): string {
    switch (categoria) {
      case 'Estructuras': return 'Componentes estructurales del inmueble';
      case 'Acabados': return 'Elementos de terminación y acabado';
      case 'Instalaciones Eléctricas y Sanitarias': return 'Sistemas eléctricos y sanitarios';
      default: return '';
    }
  }

  function getSubcategoriaDescription(subcategoria: string): string {
    switch (subcategoria) {
      case 'Muros y Columnas': return 'Elementos verticales estructurales';
      case 'Techos': return 'Cubiertas y techumbres';
      case 'Pisos': return 'Pavimentos y contrapisos';
      case 'Puertas y Ventanas': return 'Aberturas y cerramientos';
      case 'Revestimientos': return 'Acabados de superficies';
      case 'Baños': return 'Aparatos y accesorios sanitarios';
      case 'Instalaciones Eléctricas y Sanitarias': return 'Redes eléctricas y de agua';
      default: return '';
    }
  }

  function getLetraDescription(letra: string): string {
    const descripciones: Record<string, string> = {
      'A': 'Calidad muy alta - Lujo',
      'B': 'Calidad alta - Superior',
      'C': 'Calidad media alta',
      'D': 'Calidad media',
      'E': 'Calidad media baja',
      'F': 'Calidad baja',
      'G': 'Calidad muy baja',
      'H': 'Calidad económica',
      'I': 'Calidad muy económica'
    };
    return descripciones[letra] || `Clasificación ${letra}`;
  }

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2,
        pb: 2,
        borderBottom: '2px solid',
        borderColor: 'primary.main'
      }}>
        <Box sx={{
          p: 1,
          borderRadius: 1,
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CategoryIcon />
        </Box>
        <Typography variant="h6" fontWeight={600}>
          Formulario de Valores Unitarios
        </Typography>
      </Box>

      {/* Fila única con todos los campos */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        mb: 3,
        alignItems: 'center'
      }}>
        {/* Año */}
        <Box sx={{ flex: '1 1 120px', minWidth: '120px' }}>
          <Autocomplete
            options={años}
            getOptionLabel={(option) => option.label}
            value={años.find(a => parseInt(a.value) === añoSeleccionado) || null}
            onChange={(_, newValue) => {
              onAñoChange(newValue ? parseInt(newValue.value) : null);
            }}
            loading={loading}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Año *"
                size="small"
                placeholder="Seleccione año"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                  sx: { height: 40 }
                }}
              />
            )}
          />
        </Box>

        {/* Categoría */}
        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
          <Autocomplete
            options={categorias}
            getOptionLabel={(option) => option.label}
            value={categorias.find(c => c.value === categoriaSeleccionada) || null}
            onChange={(_, newValue) => {
              onCategoriaChange(newValue ? newValue.value as CategoriaValorUnitario : null);
            }}
            loading={loading}
            disabled={loading || !añoSeleccionado}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoría *"
                size="small"
                placeholder="Seleccione categoría"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                  sx: { height: 40 }
                }}
              />
            )}
          />
        </Box>

        {/* Subcategoría */}
        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
          <Autocomplete
            options={subcategoriasDisponibles}
            getOptionLabel={(option) => option.label}
            value={subcategoriasDisponibles.find(s => s.value === subcategoriaSeleccionada) || null}
            onChange={(_, newValue) => {
              onSubcategoriaChange(newValue ? newValue.value as SubcategoriaValorUnitario : null);
            }}
            loading={loading}
            disabled={loading || !categoriaSeleccionada}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Subcategoría *"
                size="small"
                placeholder="Seleccione subcategoría"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LayersIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                  sx: { height: 40 }
                }}
              />
            )}
          />
        </Box>

        {/* Letra */}
        <Box sx={{ flex: '1 1 120px', minWidth: '120px' }}>
          <Autocomplete
            options={letras}
            getOptionLabel={(option) => `${option.value} - ${getLetraDescription(option.value)}`}
            value={letras.find(l => l.value === letraSeleccionada) || null}
            onChange={(_, newValue) => {
              onLetraChange(newValue ? newValue.value as LetraValorUnitario : null);
            }}
            loading={loading}
            disabled={loading || !subcategoriaSeleccionada}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Letra *"
                size="small"
                placeholder="Seleccione letra"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                  sx: { height: 40 }
                }}
              />
            )}
          />
        </Box>

        {/* Costo Unitario */}
        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
          <TextField
            label="Costo Unitario *"
            type="number"
            size="small"
            value={costoValue}
            onChange={(e) => onCostoChange(e.target.value)}
            disabled={loading || !letraSeleccionada}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon sx={{ fontSize: 16 }} />
                </InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">S/</InputAdornment>,
              sx: { height: 40 }
            }}
            inputProps={{
              step: 0.01,
              min: 0
            }}
            fullWidth
          />
        </Box>

        {/* Botones en la misma fila */}
        <Box sx={{ 
          display: 'flex', 

         
          flex: '0 0 100px',
          maxWidth: '100px',
        }}>
          {onRegistrar && (
            <Button
              variant="contained"
              color="primary"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={onRegistrar}
              disabled={loading || isSubmitting || !letraSeleccionada || !costoValue}
              sx={{ 
         
                maxWidth: 100,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </Button>
          )}
          
          {onEliminar && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onEliminar}
              disabled={loading || isSubmitting}
              sx={{ 
                minWidth: 70,
                maxWidth: 90,
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Eliminar
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ValorUnitarioForm;