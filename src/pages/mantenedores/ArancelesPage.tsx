// src/pages/mantenedores/ArancelesPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Button
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  ListAlt as ListIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Importar el MainLayout
import { MainLayout } from '../../layout';

// Importar los componentes (usa la versión standalone si tienes problemas de importación)
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
  };

  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
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
          </Typography>
        </Alert>

        {/* Tabs Container */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                py: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'background.paper',
                }
              }
            }}
          >
            <Tab 
              icon={<AssignmentIcon />} 
              iconPosition="start" 
              label="Asignar Aranceles" 
              id="arancel-tab-0"
              aria-controls="arancel-tabpanel-0"
            />
            <Tab 
              icon={<ListIcon />} 
              iconPosition="start" 
              label="Consultar Aranceles" 
              id="arancel-tab-1"
              aria-controls="arancel-tabpanel-1"
            />
          </Tabs>

          <CardContent>
            {/* Tab Panel 1 - Asignación */}
            <TabPanel value={activeTab} index={0}>
              <Box key={`asignacion-${refreshKey}`}>
                <AsignacionArancelForm />
              </Box>
            </TabPanel>

            {/* Tab Panel 2 - Lista */}
            <TabPanel value={activeTab} index={1}>
              <Box key={`lista-${refreshKey}`}>
                <ListaArancelesPorDireccion />
              </Box>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Footer con información */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'grey.50',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Información Adicional
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="Año Fiscal: 2025" 
                color="primary" 
                size="small"
              />
              <Chip 
                label="Moneda: Soles (S/)" 
                color="success" 
                size="small"
              />
              <Chip 
                label="Actualización: Anual" 
                color="info" 
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Reglas de Negocio:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  • Cada dirección puede tener solo un arancel activo por año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Los aranceles se aplican a todos los predios de la dirección
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Los cambios en los aranceles no son retroactivos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • El monto mínimo del arancel es S/ 0.00
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default ArancelesPage;