// src/pages/fraccionamiento/ReportesFraccionamientoPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';

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
      id={`reportes-frac-tabpanel-${index}`}
      aria-labelledby={`reportes-frac-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Componente simple de reporte
const ReporteSolicitudes: React.FC = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>Reporte de Solicitudes (PDF)</Typography>
    <Typography variant="body2" color="text.secondary">
      Genera reportes en PDF de las solicitudes de fraccionamiento con filtros por estado, fecha y contribuyente.
    </Typography>
  </Paper>
);

const DashboardFraccionamiento: React.FC = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>Dashboard Analítico</Typography>
    <Typography variant="body2" color="text.secondary">
      Visualización de estadísticas de fraccionamientos con gráficos interactivos usando Recharts.
    </Typography>
  </Paper>
);

const ReporteCronogramas: React.FC = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>Reporte de Cronogramas (PDF)</Typography>
    <Typography variant="body2" color="text.secondary">
      Genera cronogramas de pago detallados en formato PDF con información de cada cuota.
    </Typography>
  </Paper>
);

const ReportesFraccionamientoPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Reportes de Fraccionamiento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reportes y análisis de fraccionamientos de deudas tributarias
          </Typography>
        </Box>

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
                label="Reporte de Solicitudes"
              />
              <Tab
                icon={<DashboardIcon />}
                iconPosition="start"
                label="Dashboard Analítico"
              />
              <Tab
                icon={<AssessmentIcon />}
                iconPosition="start"
                label="Cronogramas de Pago"
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <ReporteSolicitudes />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <DashboardFraccionamiento />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ReporteCronogramas />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default ReportesFraccionamientoPage;
