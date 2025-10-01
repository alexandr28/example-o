// src/pages/caja/ConsultasCaja.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Importar MainLayout
import MainLayout from '../../layout/MainLayout';

// Importar componentes de consultas
import PorFecha from '../../components/caja/consultas/PorFecha';
import PorContribuyente from '../../components/caja/consultas/PorContribuyente';
import PorNumeroRecibo from '../../components/caja/consultas/PorNumeroRecibo';

// Styled Components
const HeaderBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  '& .MuiTab-root': {
    color: 'white',
    opacity: 0.8,
    fontWeight: 500,
    '&.Mui-selected': {
      opacity: 1,
      fontWeight: 'bold'
    }
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'white',
    height: 3
  }
}));

const ContentBox = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  backgroundColor: '#f5f5f5',
  overflowY: 'auto'
}));

// Interfaz para el panel de tabs
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
      id={`consultas-tabpanel-${index}`}
      aria-labelledby={`consultas-tab-${index}`}
      sx={{ height: '100%' }}
    >
      {value === index && children}
    </Box>
  );
};

const ConsultasCaja: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Manejar cambio de tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Funcion para exportar a PDF
  const handleExportPdf = () => {
    console.log('Exportando a PDF...');
    // Aqui se implementara la logica de exportacion a PDF
  };

  // Funcion para imprimir
  const handlePrint = () => {
    window.print();
    // Se puede mejorar con una vista de impresion especifica
  };

  // Funcion para obtener el icono del tab actual
  const getTabIcon = (index: number) => {
    switch (index) {
      case 0:
        return <CalendarIcon sx={{ fontSize: 20, mr: 1 }} />;
      case 1:
        return <PersonIcon sx={{ fontSize: 20, mr: 1 }} />;
      case 2:
        return <ReceiptIcon sx={{ fontSize: 20, mr: 1 }} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 2, height: 'calc(100vh - 100px)' }}>
        <StyledPaper>
          {/* Header */}
          <HeaderBox>
            <Typography variant="h5" fontWeight="bold">
              RECIBOS CANCELADOS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Exportar a PDF">
                <IconButton
                  onClick={handleExportPdf}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <PdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimir">
                <IconButton
                  onClick={handlePrint}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </HeaderBox>

          {/* Tabs */}
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="tabs de consultas"
            variant="fullWidth"
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTabIcon(0)}
                  POR FECHAS
                </Box>
              }
              id="consultas-tab-0"
              aria-controls="consultas-tabpanel-0"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTabIcon(1)}
                  POR CONTRIBUYENTE
                </Box>
              }
              id="consultas-tab-1"
              aria-controls="consultas-tabpanel-1"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTabIcon(2)}
                  POR NUMERO DE RECIBO
                </Box>
              }
              id="consultas-tab-2"
              aria-controls="consultas-tabpanel-2"
            />
          </StyledTabs>

          {/* Content */}
          <ContentBox>
            <TabPanel value={tabValue} index={0}>
              <PorFecha onExportPdf={handleExportPdf} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <PorContribuyente onExportPdf={handleExportPdf} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <PorNumeroRecibo onExportPdf={handleExportPdf} />
            </TabPanel>
          </ContentBox>
        </StyledPaper>
      </Box>
    </MainLayout>
  );
};

export default ConsultasCaja;