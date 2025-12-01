// src/pages/coactiva/ExpedientePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';
import { ExpedientesTable, NuevoExpedienteForm } from '../../components/coactiva';
import { NotificationService } from '../../components/utils/Notification';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: `0 4px 20px ${theme.palette.primary.main}30`,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minHeight: 64,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
}));

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
      id={`expediente-tabpanel-${index}`}
      aria-labelledby={`expediente-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ExpedientePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleView = (expediente: any) => {
    NotificationService.info(`Ver detalles del expediente: ${expediente.numeroExpediente}`);
  };

  const handleEdit = (expediente: any) => {
    NotificationService.info(`Editar expediente: ${expediente.numeroExpediente}`);
  };

  const handleAdd = () => {
    // Cambiar a la pestaña de nuevo expediente
    setTabValue(0);
    NotificationService.info('Cambiando a formulario de nuevo expediente');
  };

  return (
    <MainLayout title="Expedientes Coactivos">
      <PageContainer maxWidth="xl">
        {/* Header */}
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GavelIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Expedientes Coactivos
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Gestión de expedientes de cobranza coactiva
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        {/* Contenido con Tabs */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Expedientes tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<AddIcon />}
              iconPosition="start"
              label="Nuevo Expediente"
              id="expediente-tab-0"
              aria-controls="expediente-tabpanel-0"
            />
            <Tab
              icon={<SearchIcon />}
              iconPosition="start"
              label="Consulta Expedientes"
              id="expediente-tab-1"
              aria-controls="expediente-tabpanel-1"
            />
          </StyledTabs>

          {/* Panel 1: Nuevo Expediente */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <NuevoExpedienteForm />
            </Box>
          </TabPanel>

          {/* Panel 2: Consulta Expedientes */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <ExpedientesTable
                onView={handleView}
                onEdit={handleEdit}
                onAdd={handleAdd}
              />
            </Box>
          </TabPanel>
        </Paper>
      </PageContainer>
    </MainLayout>
  );
};

export default ExpedientePage;
