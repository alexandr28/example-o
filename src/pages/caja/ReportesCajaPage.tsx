// src/pages/caja/ReportesCajaPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CompareArrows as MovementsIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import ReporteAperturaCierre from '../../components/caja/reportes/ReporteAperturaCierre';
import ReporteMovimientosCaja from '../../components/caja/reportes/ReporteMovimientosCaja';
import DashboardRecaudacionCajero from '../../components/caja/reportes/DashboardRecaudacionCajero';
import ReporteEstadoCaja from '../../components/caja/reportes/ReporteEstadoCaja';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reportes-caja-tabpanel-${index}`}
      aria-labelledby={`reportes-caja-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportesCajaPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Reportes de Caja
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reportes detallados de operaciones de caja, apertura/cierre, movimientos y análisis de recaudación
          </Typography>
        </Box>

        {/* Tabs Container */}
        <Paper elevation={3} sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }
              }}
            >
              <Tab
                icon={<ReceiptIcon />}
                iconPosition="start"
                label="Apertura y Cierre"
              />
              <Tab
                icon={<MovementsIcon />}
                iconPosition="start"
                label="Movimientos de Caja"
              />
              <Tab
                icon={<DashboardIcon />}
                iconPosition="start"
                label="Dashboard de Recaudación"
              />
              <Tab
                icon={<AssessmentIcon />}
                iconPosition="start"
                label="Estado de Caja Detallado"
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <ReporteAperturaCierre />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ReporteMovimientosCaja />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <DashboardRecaudacionCajero />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <ReporteEstadoCaja />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default ReportesCajaPage;
