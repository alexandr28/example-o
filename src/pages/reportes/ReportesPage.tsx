// src/pages/reportes/ReportesPage.tsx
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
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import ReportesContribuyentes from '../../components/reportes/ReportesContribuyentes';
import ReportesPredios from '../../components/reportes/ReportesPredios';
import ReportesRecaudacion from '../../components/reportes/ReportesRecaudacion';
import ReportesCuentas from '../../components/reportes/ReportesCuentas';

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
      id={`reportes-tabpanel-${index}`}
      aria-labelledby={`reportes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportesPage: React.FC = () => {
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
            Módulo de Reportes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Genera reportes detallados, dashboards analíticos y exportaciones en PDF
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
                icon={<PdfIcon />}
                iconPosition="start"
                label="Reporte de Contribuyentes"
              />
              <Tab
                icon={<PdfIcon />}
                iconPosition="start"
                label="Reporte de Predios"
              />
              <Tab
                icon={<DashboardIcon />}
                iconPosition="start"
                label="Dashboard de Recaudación"
              />
              <Tab
                icon={<ReceiptIcon />}
                iconPosition="start"
                label="Reporte de Cuentas Corrientes"
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <ReportesContribuyentes />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ReportesPredios />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <ReportesRecaudacion />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <ReportesCuentas />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default ReportesPage;
