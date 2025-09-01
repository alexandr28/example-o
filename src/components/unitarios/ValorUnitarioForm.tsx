// src/components/unitarios/ValorUnitarioForm.tsx
import React from 'react';
import {
  Paper,
  Box,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Autocomplete,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Category as CategoryIcon,
  Title as TitleIcon,
  Layers as LayersIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon
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
  onNuevo?: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
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
  onNuevo,
  isSubmitting = false,
  isEditMode = false
}) => {
  const theme = useTheme();





  // Helpers para descripciones

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
      

      {/* Primera fila con los campos del formulario */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        mb: 2,
        alignItems: 'center'
      }}>
        {/* Selector Año */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 120px' },
          minWidth: { xs: '100%', md: '120px' }
        }}>
          <TextField
            fullWidth
            size="small"
            label="Año"
            type="number"
            value={añoSeleccionado || ''}
            onChange={(e) => onAñoChange(parseInt(e.target.value) || null)}
            InputProps={{
              inputProps: { 
                min: 1900, 
                max: new Date().getFullYear() 
              }
            }}
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
                 S./
                </InputAdornment>
              ),
             
              sx: { height: 40 }
            }}
            inputProps={{
              step: 0.01,
              min: 0
            }}
            fullWidth
          />
        </Box>
      </Box>

      {/* Tercera fila: Botones */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        mt: 2,
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        {/* Botón Registrar */}
        {onRegistrar && (
          <Button
            variant="contained"
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={onRegistrar}
            disabled={loading || isSubmitting || !letraSeleccionada || !costoValue}
            sx={{ 
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
        
        {/* Botón Nuevo */}
        {onNuevo && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={onNuevo}
            disabled={loading || isSubmitting}
            sx={{ 
              minWidth: 90,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Nuevo
          </Button>
        )}
        
        {/* Botón Eliminar - Solo visible en modo edición */}
        {isEditMode && onEliminar && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onEliminar}
            disabled={loading || isSubmitting}
            sx={{ 
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.dark',
                backgroundColor: alpha(theme.palette.error.main, 0.04)
              }
            }}
          >
            Eliminar
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ValorUnitarioForm;