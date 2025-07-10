// src/pages/mantenedores/ValoresUnitariosPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Button,
  Typography,
  Alert,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { 
  Breadcrumb, 
  ValorUnitarioForm, 
  ValorUnitarioList 
} from '../../components';
import { useValoresUnitarios } from '../../hooks/useValoresUnitarios';
import { NotificationService } from '../../components/utils/Notification';

const ValoresUnitariosPage: React.FC = () => {
  const theme = useTheme();
  
  // Hook personalizado
  const {
    valoresUnitarios,
    años,
    categorias,
    subcategoriasDisponibles,
    letras,
    loading,
    error,
    cargarValoresUnitarios,
    registrarValorUnitario,
    eliminarValorUnitario,
    obtenerValoresUnitariosPorCategoria,
    añoSeleccionado,
    categoriaSeleccionada,
    subcategoriaSeleccionada,
    letraSeleccionada,
    setAñoSeleccionado,
    setCategoriaSeleccionada,
    setSubcategoriaSeleccionada,
    setLetraSeleccionada,
  } = useValoresUnitarios();

  // Estados locales
  const [costo, setCosto] = useState<string>('0.00');
  const [añoTabla, setAñoTabla] = useState<number | null>(null);
  const [valoresPorCategoria, setValoresPorCategoria] = useState<Record<string, Record<string, number>>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar formulario
  useEffect(() => {
    const valid = añoSeleccionado !== null && 
                  categoriaSeleccionada !== null && 
                  subcategoriaSeleccionada !== null && 
                  letraSeleccionada !== null && 
                  costo !== '' && 
                  parseFloat(costo) > 0;
    setIsFormValid(valid);
  }, [añoSeleccionado, categoriaSeleccionada, subcategoriaSeleccionada, letraSeleccionada, costo]);

  // Cargar valores unitarios al montar
  useEffect(() => {
    cargarValoresUnitarios();
  }, [cargarValoresUnitarios]);

  // Calcular valores cuando cambia el año de la tabla
  useEffect(() => {
    if (añoTabla) {
      const valores = obtenerValoresUnitariosPorCategoria(añoTabla);
      setValoresPorCategoria(valores);
    }
  }, [añoTabla, valoresUnitarios, obtenerValoresUnitariosPorCategoria]);

  // Migas de pan
  const breadcrumbItems = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Valores Unitarios', active: true }
  ];

  // Handlers
  const handleCostoChange = (value: string) => {
    // Validar que sea un número válido
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCosto(value);
    }
  };

  const handleRegistrar = async () => {
    try {
      const formData = {
        año: añoSeleccionado!,
        categoria: categoriaSeleccionada!,
        subcategoria: subcategoriaSeleccionada!,
        letra: letraSeleccionada!,
        costo: parseFloat(costo)
      };
      
      await registrarValorUnitario(formData);
      NotificationService.success('Valor unitario registrado exitosamente');
      
      // Limpiar formulario después de registrar
      setCosto('0.00');
      setLetraSeleccionada(null);
      
      // Recargar valores si está viendo el mismo año
      if (añoTabla === añoSeleccionado) {
        const valores = obtenerValoresUnitariosPorCategoria(añoTabla);
        setValoresPorCategoria(valores);
      }
    } catch (err: any) {
      NotificationService.error(err.message || 'Error al registrar el valor unitario');
    }
  };

  const handleEliminar = async () => {
    if (!añoTabla) {
      NotificationService.warning('Seleccione un año en la tabla para eliminar');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar todos los valores del año ${añoTabla}?`)) {
      try {
        // Filtrar todos los valores del año seleccionado
        const valoresDelAño = valoresUnitarios.filter(v => v.año === añoTabla);
        
        // Eliminar cada valor
        for (const valor of valoresDelAño) {
          await eliminarValorUnitario(valor.id);
        }
        
        NotificationService.success(`Valores del año ${añoTabla} eliminados exitosamente`);
        
        // Actualizar la tabla
        setValoresPorCategoria({});
      } catch (err) {
        NotificationService.error('Error al eliminar los valores');
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <ConstructionIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Valores Unitarios
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Configure los valores unitarios por categoría, subcategoría y calidad de construcción
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>
        </Stack>

        {/* Alert informativo */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Los valores unitarios determinan el costo base de construcción según la categoría del inmueble. 
            Configure cada combinación de categoría, subcategoría y letra (calidad) con su respectivo valor.
          </Typography>
        </Alert>
        
        {/* Mostrar errores */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Contenedor principal */}
        <Stack spacing={3}>
          {/* Sección superior: Formulario y botones */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Stack 
              direction={{ xs: 'column', lg: 'row' }} 
              spacing={3}
              alignItems={{ xs: 'stretch', lg: 'flex-start' }}
            >
              {/* Formulario */}
              <Box sx={{ flex: 1 }}>
                <ValorUnitarioForm 
                  años={años}
                  categorias={categorias}
                  subcategoriasDisponibles={subcategoriasDisponibles}
                  letras={letras}
                  añoSeleccionado={añoSeleccionado}
                  categoriaSeleccionada={categoriaSeleccionada}
                  subcategoriaSeleccionada={subcategoriaSeleccionada}
                  letraSeleccionada={letraSeleccionada}
                  loading={loading}
                  onAñoChange={setAñoSeleccionado}
                  onCategoriaChange={setCategoriaSeleccionada}
                  onSubcategoriaChange={setSubcategoriaSeleccionada}
                  onLetraChange={setLetraSeleccionada}
                  onCostoChange={handleCostoChange}
                  costoValue={costo}
                />
              </Box>
              
              {/* Botones de acción */}
              <Stack 
                spacing={2} 
                sx={{ 
                  minWidth: { xs: '100%', sm: 200 },
                  justifyContent: 'center'
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleRegistrar}
                  disabled={loading || !isFormValid}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  fullWidth
                  sx={{
                    height: 48,
                    fontWeight: 600,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={handleEliminar}
                  disabled={loading || !añoTabla}
                  startIcon={<DeleteIcon />}
                  fullWidth
                  sx={{
                    height: 48,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.08)
                    }
                  }}
                >
                  Eliminar
                </Button>
              </Stack>
            </Stack>
          </Paper>
          
          {/* Tabla de valores unitarios */}
          <ValorUnitarioList 
            años={años}
            añoTabla={añoTabla}
            valoresPorCategoria={valoresPorCategoria}
            loading={loading}
            onAñoTablaChange={setAñoTabla}
          />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default ValoresUnitariosPage;