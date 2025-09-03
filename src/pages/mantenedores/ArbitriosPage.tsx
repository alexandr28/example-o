import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import {
  CleaningServices as CleaningIcon,
  Security as SecurityIcon,
  Park as ParkIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import LimpiezaPublica from '../../components/arbitrios/LimpiezaPublica';
import ParquesJardines from '../../components/arbitrios/ParquesJardines';
import Serenazgo from '../../components/arbitrios/Serenazgo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`arbitrios-tabpanel-${index}`}
      aria-labelledby={`arbitrios-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `arbitrios-tab-${index}`,
    'aria-controls': `arbitrios-tabpanel-${index}`,
  };
};

const ArbitriosPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <MainLayout title="Arbitrios Municipales">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1
          }}
        >
          Gestión de Arbitrios Municipales
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '1rem'
          }}
        >
          Administración de tasas por servicios municipales
        </Typography>
      </Box>

      {/* Main Content with Tabs */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Tabs de arbitrios municipales"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
                minHeight: 64,
                px: 3,
                '&.Mui-selected': {
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              icon={<CleaningIcon />} 
              iconPosition="start" 
              label="Limpieza Pública" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label="Serenazgo" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<ParkIcon />} 
              iconPosition="start" 
              label="Parques y Jardines" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <LimpiezaPublica />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Serenazgo />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ParquesJardines />
        </TabPanel>
      </Paper>
    </MainLayout>
  );
};

export default ArbitriosPage;