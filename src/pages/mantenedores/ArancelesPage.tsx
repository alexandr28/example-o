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
import { AsignacionArancelForm } from '../../components/aranceles/AsignacionArancelForm';
import { ListaArancelesPorDireccion } from '../../components/aranceles/ListaArancelesPorDireccion';

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
              Los aranceles se asignan por dirección y año. Cada dirección puede tener un único valor de arancel por año fiscal.
              El sistema utiliza formularios tipo form-data y no requiere autenticación.
            </Typography>
          </Alert>

          {/* Tabs */}
          <Paper sx={{ width: '100%' }}>
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
                <AsignacionArancelForm key={`asignacion-${refreshKey}`} />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 3 }}>
                <ListaArancelesPorDireccion key={`lista-${refreshKey}`} />
              </Box>
            </TabPanel>
          </Paper>

          {/* Información adicional */}
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Información importante:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Los aranceles se asignan por año y dirección específica
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Cada dirección solo puede tener un arancel por año
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • El costo del arancel se expresa en soles (S/)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Para editar un arancel existente, seleccione el mismo año y dirección
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default ArancelesPage;