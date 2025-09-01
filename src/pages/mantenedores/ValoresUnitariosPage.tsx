// src/pages/mantenedores/ValoresUnitariosPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Button,
  Typography,
  Alert,
  Paper,
  useTheme,
  alpha,
  Tabs,
  Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Construction as ConstructionIcon,
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { 
  Breadcrumb, 
  ValorUnitarioForm, 
  ValorUnitarioList 
} from '../../components';
import { useValoresUnitarios } from '../../hooks/useValoresUnitarios';
import { NotificationService } from '../../components/utils/Notification';

// Interface para TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`valores-unitarios-tabpanel-${index}`}
      aria-labelledby={`valores-unitarios-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

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
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);


  // Cargar valores unitarios al montar con el año seleccionado
  useEffect(() => {
    if (añoSeleccionado) {
      cargarValoresUnitarios({ anio: añoSeleccionado });
    }
  }, [cargarValoresUnitarios, añoSeleccionado]);

  // Ya no necesitamos manejar la carga de datos para la tabla aquí
  // porque el ValorUnitarioList ahora lo hace internamente

  // Manejar cambio de tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Migas de pan
  const breadcrumbItems = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Valores Unitarios', active: true }
  ];


  // Handler para selección de valor desde la tabla
  const handleValorSeleccionado = (datos: {
    año: number;
    categoria: string;
    subcategoria: string;
    letra: string;
    costo: number;
  }) => {
    console.log('🎯 [ValoresUnitariosPage] Valor seleccionado desde tabla:', datos);
    
    // Llenar el formulario con los datos seleccionados
    setAñoSeleccionado(datos.año);
    
    // Usar la categoría que ya viene mapeada desde ValorUnitarioList
    setCategoriaSeleccionada(datos.categoria as any);
    
    // Establecer subcategoría, letra y costo con un pequeño delay para asegurar que la categoría se procese primero
    setTimeout(() => {
      setSubcategoriaSeleccionada(datos.subcategoria as any);
      setLetraSeleccionada(datos.letra as any);
      setCosto(datos.costo.toString());
    }, 100);
    
    // Activar modo edición
    setIsEditMode(true);
    
    // Cambiar al tab de formulario al seleccionar un valor
    setTabValue(0);
  };

  // Handlers
  const handleCostoChange = (value: string) => {
    // Validar que sea un número válido
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCosto(value);
    }
  };

  const handleRegistrar = async () => {
    try {
      console.log('📝 [ValoresUnitariosPage] Iniciando registro con datos:', {
        año: añoSeleccionado,
        categoria: categoriaSeleccionada,
        subcategoria: subcategoriaSeleccionada,
        letra: letraSeleccionada,
        costo: parseFloat(costo)
      });

      const formData = {
        año: añoSeleccionado!,
        categoria: categoriaSeleccionada!,
        subcategoria: subcategoriaSeleccionada!,
        letra: letraSeleccionada!,
        costo: parseFloat(costo)
      };
      
      await registrarValorUnitario(formData);
      
      // Limpiar formulario después de registrar
      setCosto('0.00');
      setLetraSeleccionada(null);
      setIsEditMode(false); // Desactivar modo edición después de guardar
      
      console.log('✅ [ValoresUnitariosPage] Registro completado exitosamente');
      
      // Forzar actualización inmediata de la tabla recargando datos del año
      if (añoSeleccionado) {
        console.log('🔄 [ValoresUnitariosPage] Forzando recarga de datos para actualizar tabla...');
        await cargarValoresUnitarios({ anio: añoSeleccionado });
        // Incrementar clave para forzar re-render de la tabla
        setRefreshKey(prev => prev + 1);
      }
      
      // Cambiar al tab de lista después de registrar
      setTabValue(1);
      
    } catch (err: any) {
      console.error('❌ [ValoresUnitariosPage] Error en registro:', err);
      NotificationService.error(err.message || 'Error al registrar el valor unitario');
    }
  };

  const handleEliminar = async () => {
    if (!añoSeleccionado) {
      NotificationService.warning('Seleccione un año en el formulario para eliminar sus valores');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar todos los valores del año ${añoSeleccionado}?`)) {
      try {
        // Filtrar todos los valores del año seleccionado
        const valoresDelAño = valoresUnitarios.filter(v => v.año === añoSeleccionado);
        
        // Eliminar cada valor
        for (const valor of valoresDelAño) {
          await eliminarValorUnitario(valor.id);
        }
        
        NotificationService.success(`Valores del año ${añoSeleccionado} eliminados exitosamente`);
        
        // La tabla se actualizará automáticamente
      } catch (err) {
        NotificationService.error('Error al eliminar los valores');
      }
    }
  };

  const handleNuevo = () => {
    // Limpiar el formulario
    setAñoSeleccionado(null);
    setCategoriaSeleccionada(null);
    setSubcategoriaSeleccionada(null);
    setLetraSeleccionada(null);
    setCosto('0.00');
    setIsEditMode(false); // Desactivar modo edición
    console.log('🆕 [ValoresUnitariosPage] Formulario limpiado para nuevo registro');
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
        
        {/* Contenedor principal con tabs */}
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header con tabs */}
          <Box sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="valores unitarios tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  '&.Mui-selected': {
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab 
                icon={<AddIcon />} 
                iconPosition="start"
                label="Configurar Valores"
                id="valores-unitarios-tab-0"
                aria-controls="valores-unitarios-tabpanel-0"
              />
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start"
                label="Lista de Valores" 
                id="valores-unitarios-tab-1"
                aria-controls="valores-unitarios-tabpanel-1"
              />
            </Tabs>
          </Box>

          {/* Panel de Formulario */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
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
                    onRegistrar={handleRegistrar}
                    onNuevo={handleNuevo}
                    onEliminar={handleEliminar}
                    isSubmitting={loading}
                    isEditMode={isEditMode}
                  />
                </Box>
                
            
              </Stack>
            </Box>
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <ValorUnitarioList 
                key={`tabla-${añoSeleccionado}-${refreshKey}`}
                años={años}
                añoSeleccionado={añoSeleccionado}
                onValorSeleccionado={handleValorSeleccionado}
              />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default ValoresUnitariosPage;