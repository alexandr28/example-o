// src/pages/mantenedores/ArancelesPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  Alert,
  Button,
  Container
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  ListAlt as ListIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Importar el MainLayout
import MainLayout from '../../layout/MainLayout';

// Importar los componentes
import { AsignacionArancelForm } from '../../components/aranceles/ArancelForm';
import { ListaArancelesPorDireccion } from '../../components/aranceles/ArancelList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`arancel-tabpanel-${index}`}
      aria-labelledby={`arancel-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );
};

const ArancelesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams, setSearchParams] = useState<{ anio: number; codDireccion: number } | null>(null);
  const [editArancel, setEditArancel] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Función para manejar la redirección desde el formulario a la lista
  const handleRedirectToList = (params: { anio: number; codDireccion: number }) => {
    console.log('🔄 [ArancelesPage] Recibiendo parámetros para redirección:', params);
    setSearchParams(params);
    setEditArancel(null); // Limpiar datos de edición
    setActiveTab(1); // Cambiar al tab de lista (índice 1)
  };

  // Función para manejar la edición desde la lista al formulario
  const handleEditFromList = (arancel: any) => {
    console.log('✏️ [ArancelesPage] Editando arancel desde lista:', arancel);
    setEditArancel(arancel);
    setActiveTab(0); // Cambiar al tab de formulario (índice 0)
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Forzar recarga de los componentes
    window.location.reload();
  };

  return (
    <MainLayout title="Gestión de Aranceles">
      <Container maxWidth="xl">
        <Box sx={{ width: '100%', py: 3 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Gestión de Aranceles
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configure y administre los aranceles por dirección para cada año fiscal
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
            >
              Actualizar
            </Button>
          </Stack>

          {/* Alert informativo */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              Los aranceles se gestionan usando la nueva API general con búsqueda avanzada por sector, barrio y calle.
              El sistema utiliza GET con query params para consultas y POST JSON para creación, sin autenticación.
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
              Nueva API General: http://26.161.18.122:8080/api/arancel/listaGeneral?parametroBusqueda=a&anio=2025&codUsuario=1
            </Typography>
          </Alert>

          {/* Tabs */}
          <Paper sx={{ width: '100%%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="Tabs de gestión de aranceles"
                variant="fullWidth"
              >
                <Tab 
                  icon={<AssignmentIcon />} 
                  iconPosition="start" 
                  label="Asignación de Aranceles" 
                  id="arancel-tab-0"
                  aria-controls="arancel-tabpanel-0"
                />
                <Tab 
                  icon={<ListIcon />} 
                  iconPosition="start" 
                  label="Lista de Aranceles" 
                  id="arancel-tab-1"
                  aria-controls="arancel-tabpanel-1"
                />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ p: 3 }}>
                <AsignacionArancelForm 
                  key={`asignacion-${refreshKey}`}
                  onRedirectToList={handleRedirectToList}
                  editData={editArancel}
                />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 3 }}>
                <ListaArancelesPorDireccion 
                  key={`lista-${refreshKey}`}
                  initialSearchParams={searchParams}
                  onEditArancel={handleEditFromList}
                  useGeneralApi={true}
                />
              </Box>
            </TabPanel>
          </Paper>

          {/* Información adicional */}
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', maxWidth:'65%' }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Nueva API General - Información importante:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Búsqueda avanzada por sector, barrio, calle o dirección completa
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Los aranceles incluyen información detallada de ubicación
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • El costo del arancel se expresa en soles (S/)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Datos disponibles: sector, barrio, calle y dirección completa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Use la búsqueda general para encontrar aranceles por cualquier criterio
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default ArancelesPage;