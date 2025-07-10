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
  Divider
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Title as TitleIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
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
  costoValue
}) => {
  const theme = useTheme();

  // Convertir las opciones al formato esperado por SearchableSelect
  const añoOptions = años.map(año => ({
    id: año.value,
    value: parseInt(año.value),
    label: año.label,
    description: año.value === new Date().getFullYear().toString() ? 'Año actual' : undefined
  }));

  const categoriaOptions = categorias.map(cat => ({
    id: cat.value,
    value: cat.value,
    label: cat.label,
    description: getCategoriaDescription(cat.value)
  }));

  const subcategoriaOptions = subcategoriasDisponibles.map(sub => ({
    id: sub.value,
    value: sub.value,
    label: sub.label,
    description: getSubcategoriaDescription(sub.value)
  }));

  const letraOptions = letras.map(letra => ({
    id: letra.value,
    value: letra.value,
    label: letra.label,
    description: getLetraDescription(letra.value)
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
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <CategoryIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Valores Unitarios
          </Typography>
        </Stack>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Primera fila: Año y Categoría */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <SearchableSelect
                label="Año"
                options={añoOptions}
                value={añoSeleccionado ? añoOptions.find(opt => opt.value === añoSeleccionado) || null : null}
                onChange={(option) => onAñoChange(option ? option.value : null)}
                placeholder="Seleccione el año"
                disabled={loading}
                required
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                )}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <SearchableSelect
                label="Categoría"
                options={categoriaOptions}
                value={categoriaSeleccionada ? categoriaOptions.find(opt => opt.value === categoriaSeleccionada) || null : null}
                onChange={(option) => onCategoriaChange(option ? option.value as CategoriaValorUnitario : null)}
                placeholder="Seleccione la categoría"
                disabled={loading || !añoSeleccionado}
                required
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LayersIcon fontSize="small" color="action" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{option.label}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                )}
              />
            </Box>
          </Stack>
          
          {/* Segunda fila: Subcategoría y Letra */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <SearchableSelect
                label="Subcategoría"
                options={subcategoriaOptions}
                value={subcategoriaSeleccionada ? subcategoriaOptions.find(opt => opt.value === subcategoriaSeleccionada) || null : null}
                onChange={(option) => onSubcategoriaChange(option ? option.value as SubcategoriaValorUnitario : null)}
                placeholder="Seleccione la subcategoría"
                disabled={loading || !categoriaSeleccionada}
                required
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <SearchableSelect
                label="Letra (Calidad)"
                options={letraOptions}
                value={letraSeleccionada ? letraOptions.find(opt => opt.value === letraSeleccionada) || null : null}
                onChange={(option) => onLetraChange(option ? option.value as LetraValorUnitario : null)}
                placeholder="Seleccione la letra"
                disabled={loading || !subcategoriaSeleccionada}
                required
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: theme.palette.primary.main
                        }}
                      >
                        {option.label}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              />
            </Box>
          </Stack>
          
          <Divider />
          
          {/* Tercera fila: Costo */}
          <Box>
            <TextField
              fullWidth
              label="Costo Unitario"
              type="number"
              value={costoValue}
              onChange={(e) => onCostoChange(e.target.value)}
              disabled={loading || !letraSeleccionada}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">S/</InputAdornment>
              }}
              inputProps={{
                step: 0.01,
                min: 0
              }}
              helperText={letraSeleccionada ? "Ingrese el costo unitario para la configuración seleccionada" : "Seleccione todos los campos anteriores"}
            />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ValorUnitarioForm;